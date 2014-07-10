<?php

class WeightTicketRepository implements WeightTicketRepositoryInterface {
    
    public function findAll($params = array())
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $page     = isset($params['page']) ? $params['page'] : 1;
            $sortby   = isset($params['sortby']) ? $params['sortby'] : 'id';
            $orderby  = isset($params['orderby']) ? $params['orderby'] :'DSC';
            $offset   = $page * $perPage - $perPage;
            
            $result = WeightTicket::take($perPage)
                ->offset($offset)
                ->orderBy($sortby, $orderby)
                ->paginate($perPage);
            
            return $result;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function findById($schedule_id)
    {
        try
        {
            $weightticket = WeightTicket::with('status')
                            ->with('weightticketscale_dropoff.weightticketproducts.transportscheduleproduct.productorder.product')
                            ->with('weightticketscale_dropoff.scalerAccount')
                            ->with('weightticketscale_dropoff.scale')
                            ->with('weightticketscale_pickup.weightticketproducts.transportscheduleproduct.productorder.product')
                            ->with('weightticketscale_pickup.scalerAccount')
                            ->with('weightticketscale_pickup.scale')
                            ->where('transportSchedule_id', '=', $schedule_id)->first();

            if(!$weightticket) 
                throw new NotFoundException('Weight Info Not Found');

            return $weightticket;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    //get all weight ticket (dropoff or pickup) of order
    public function getAllWeightticketOfOrder($orderId){
        $orderDetails = Order::with('transportschedule.weightticket.weightticketscale_pickup')
                                ->with('transportschedule.weightticket.weightticketscale_dropoff')
                                ->with('transportschedule.weightticket.status')
                                ->where('id', '=', $orderId)->first()->toArray();
        // return $orderDetails;

        $weightTicketList = array();
        $index = 0;

        //identify which detail to be used, dropoff or pickup weightticket
        foreach($orderDetails['transportschedule'] as $transportScheduleDetails){
            if($transportScheduleDetails['weightticket']['pickup_id'] != null){
                $pickupNetWeight = $this->getNetWeight($transportScheduleDetails['weightticket']['weightticketscale_pickup']['gross'], $transportScheduleDetails['weightticket']['weightticketscale_pickup']['tare']);
            }

            if($transportScheduleDetails['weightticket']['dropoff_id'] != null){
                $dropoffNetWeight = $this->getNetWeight($transportScheduleDetails['weightticket']['weightticketscale_dropoff']['gross'], $transportScheduleDetails['weightticket']['weightticketscale_dropoff']['tare']);
            }
            
            if($transportScheduleDetails['weightticket']['pickup_id'] != null && $transportScheduleDetails['weightticket']['dropoff_id'] != null){
                if($pickupNetWeight >= $dropoffNetWeight){
                    $weightTicketList[$index] = $transportScheduleDetails['weightticket']['weightticketscale_pickup'];
                    $netWeight = $pickupNetWeight;
                    
                } else {
                    $weightTicketList[$index] = $transportScheduleDetails['weightticket']['weightticketscale_dropoff'];
                    $netWeight = $dropoffNetWeight;
                    
                }
            } else if($transportScheduleDetails['weightticket']['pickup_id'] != null){
                $weightTicketList[$index] = $transportScheduleDetails['weightticket']['weightticketscale_pickup'];
                $netWeight = $pickupNetWeight;
            } else if($transportScheduleDetails['weightticket']['dropoff_id'] != null){
                $weightTicketList[$index] = $transportScheduleDetails['weightticket']['weightticketscale_dropoff'];
                $netWeight = $dropoffNetWeight;
            } else {
                $netWeight = 0;
            }
            $weightTicketList[$index]['transportScheduleId'] = $transportScheduleDetails['id'];
            $weightTicketList[$index]['transportScheduleDate'] = $transportScheduleDetails['date'];
            $weightTicketList[$index]['weightTicketNumber'] = $transportScheduleDetails['weightticket']['weightTicketNumber'];
            $weightTicketList[$index]['status'] = $transportScheduleDetails['weightticket']['status'];
            $weightTicketList[$index]['netWeight'] = number_format($netWeight, 4); //format to 4 decimal places
            $index++;
        }

        return $weightTicketList;             
    }

    private function getNetWeight($gross, $tare){
        return $gross-$tare;
    }
    
    public function store($data)
    {
        $hasExisitingTicket = WeightTicket::where('transportSchedule_id', '=', $data['transportSchedule_id'])->first();
        if($hasExisitingTicket != null){
            if(isset($data['dropoff_info'])){
                if($hasExisitingTicket->dropoff_id != null){
                    return array(
                      'error' => true,
                      'message' => 'This schedule already has dropoff weight ticket.');
                }
            }
            else if(isset($data['pickup_info'])){
                if($hasExisitingTicket->pickup_id != null){
                    return array(
                      'error' => true,
                      'message' => 'This schedule already has pickup weight ticket.');
                }
            }

            $result = $this->update($data['transportSchedule_id'], $data);
            if(is_array($result)){
                return array(
                  'error' => false,
                  'message' => 'Weight ticket successfully created');
            }
        }

        $result = DB::transaction(function() use ($data){
            $isPickup = false;
            $isDropoff = false;
            //do not required fields if not to be close
            $toBeClose = false;
            if(isset($data['status_id'])){
                if($data['status_id'] == 2){ //close status
                    $toBeClose =  true;
                }
            }
            
            if(isset($data['pickup_info'])){
                if($toBeClose){
                    //for pickup data
                    $this->validate($data['pickup_info'], 'WeightTicketScale');
                } else {
                    $this->setEmptyValuesToNull($data['pickup_info']);
                }
                $weightticketscale_pickup = new WeightTicketScale;
                $data['pickup_info']['type'] = 1; //for pickup type
                $weightticketscale_pickup->fill($data['pickup_info']);
                $weightticketscale_pickup->save();

                foreach($data['pickup_info']['products'] as $product){
                    $product['weightTicketScale_id'] = $weightticketscale_pickup->id;
                    if($toBeClose){
                        $this->validate($product, 'WeightTicketProducts');
                    } else {
                        $this->setEmptyValuesToNullForProducts($product);
                    }
                    $weightticketproduct = new WeightTicketProducts;
                    $weightticketproduct->fill($product);
                    $weightticketproduct->save();
                }
                $isPickup = true;
            }

            if(isset($data['dropoff_info'])){
                if($toBeClose){
                    //for dropoff data
                    $this->validate($data['dropoff_info'], 'WeightTicketScale');
                } else {
                    $this->setEmptyValuesToNull($data['dropoff_info']);
                }
                $weightticketscale_dropoff = new WeightTicketScale;
                $data['dropoff_info']['type'] = 2; //for dropoff type
                $weightticketscale_dropoff->fill($data['dropoff_info']);
                $weightticketscale_dropoff->save();

                foreach($data['dropoff_info']['products'] as $product){
                    $product['weightTicketScale_id'] = $weightticketscale_dropoff->id;
                    if($toBeClose){
                        $this->validate($product, 'WeightTicketProducts');
                    } else {
                        $this->setEmptyValuesToNullForProducts($product);
                    }
                    $weightticketproduct = new WeightTicketProducts;
                    $weightticketproduct->fill($product);
                    $weightticketproduct->save();
                }
                $isDropoff = true;
            }

            $this->validate($data, 'WeightTicket');
            $data['weightTicketNumber'] = $this->generateWeightTicketNumber();
            $tickets = $this->generateLoadingTicketNumber();
            $data['loadingTicketNumber'] = $tickets['loadingTicket'];
            $data['unloadingTicketNumber'] = $tickets['unloadingTicket'];
            if($isPickup)
                $data['pickup_id'] = $weightticketscale_pickup->id;
            if($isDropoff)
                $data['dropoff_id'] = $weightticketscale_dropoff->id;

            $weightticket = new WeightTicket;
            if($toBeClose){
                $data['status_id'] = 2; //close status
            } else {
                $data['status_id'] = 1; //open status    
            }
            $weightticket->fill($data);
            $weightticket->save();

            return $weightticket->id;
        });
        
        if(is_array($result)){
            return $result;
        }

        return array(
              'error' => false,
              'message' => 'Weight ticket successfully created');
    }

    private function generateWeightTicketNumber(){
        $prefix = 'W';

        $dateToday = date('Y-m-d');
        $count = WeightTicket::where('created_at', 'like', $dateToday.'%')->count()+1;
        
        return $prefix.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    private function setEmptyValuesToNull(&$weightScaleDetails){
        $weightScaleDetails['scaleAccount_id'] = $weightScaleDetails['scaleAccount_id'] != '' ? $weightScaleDetails['scaleAccount_id'] : null;
        $weightScaleDetails['scale_id'] = $weightScaleDetails['scale_id'] != '' ? $weightScaleDetails['scale_id'] : null;
        $weightScaleDetails['fee'] = $weightScaleDetails['fee'] != '' ? $weightScaleDetails['fee'] : null;
        $weightScaleDetails['bales'] = $weightScaleDetails['bales'] != '' ? $weightScaleDetails['bales'] : null;
        $weightScaleDetails['gross'] = $weightScaleDetails['gross'] != '' ? $weightScaleDetails['gross'] : null;
        $weightScaleDetails['tare'] = $weightScaleDetails['tare'] != '' ? $weightScaleDetails['tare'] : null;
    }

    private function setEmptyValuesToNullForProducts(&$weightScaleProduct){
        $weightScaleProduct['bales'] = $weightScaleProduct['bales'] != '' ? $weightScaleProduct['bales'] : null;
        $weightScaleProduct['pounds'] = $weightScaleProduct['pounds'] != '' ? $weightScaleProduct['pounds'] : null;
    }

    private function generateLoadingTicketNumber(){
        $dateToday = date('Y-m-d');
        $count = WeightTicket::where('created_at', 'like', $dateToday.'%')->count()+1;
        $loadingTicket = 'L'.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
        $unloadingTicket = 'U'.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
        $tickets = array(
            'loadingTicket' => $loadingTicket,
            'unloadingTicket' => $unloadingTicket,
            );

        return $tickets;
    }

    public function getScheduleProducts($transportschedule_id){
      $orderproducts = TransportScheduleProduct::with('productorder.product')->where('transportschedule_id', '=', $transportschedule_id)->get()->toArray();

      return $orderproducts;
    } 
    
    public function update($id, $data)
    {
        $result = DB::transaction(function() use ($id, $data){

            $toBeClose = false;
            if(isset($data['status_id'])){
                if($data['status_id'] == 2){ //close status
                    $toBeClose =  true;
                }
            }
            
            $this->validate($data, 'WeightTicket');
            
            $weightticket = WeightTicket::where('transportSchedule_id', '=', $id)->first();
            if($weightticket->status_id == 2){ //if close, cannot be edit
                return array(
                  'error' => false,
                  'message' => 'You cannot edit a weight ticket that is already close');
            }
            $weightticket->fill($data);
            $weightticket->save();
            if(isset($data['pickup_info'])){
                if($toBeClose){
                //for pickup data
                    $this->validate($data['pickup_info'], 'WeightTicketScale');
                } else {
                    $this->setEmptyValuesToNull($data['pickup_info']);
                }
                if($weightticket->pickup_id == null){ //no pickup info yet, insert new pickup info for this weight ticket
                    $weightticketscale_pickup = new WeightTicketScale;
                    $data['pickup_info']['type'] = 1; //for pickup type
                    $weightticketscale_pickup->fill($data['pickup_info']);
                    $weightticketscale_pickup->save();

                    foreach($data['pickup_info']['products'] as $product){
                        $product['weightTicketScale_id'] = $weightticketscale_pickup->id;
                        if($toBeClose){
                            $this->validate($product, 'WeightTicketProducts');
                        } else {
                            $this->setEmptyValuesToNullForProducts($product);
                        }
                        $weightticketproduct = new WeightTicketProducts;
                        $weightticketproduct->fill($product);
                        $weightticketproduct->save();
                    }

                    $weightticket->pickup_id = $weightticketscale_pickup->id;
                    $weightticket->save();
                } else {
                    $weightticketscale_pickup = WeightTicketScale::find($weightticket->pickup_id);
                    $weightticketscale_pickup->fill($data['pickup_info']);
                    $weightticketscale_pickup->save();

                    foreach($data['pickup_info']['products'] as $product){
                        $product['weightTicketScale_id'] = $weightticketscale_pickup->id;
                        if($toBeClose){
                            $this->validate($product, 'WeightTicketProducts');
                        } else {
                            $this->setEmptyValuesToNullForProducts($product);
                        }
                        $weightticketproduct = WeightTicketProducts::find($product['id']);
                        $weightticketproduct->fill($product);
                        $weightticketproduct->save();
                    }
                }
            }

            if(isset($data['dropoff_info'])){
                if($toBeClose){
                    //for dropoff data
                    $this->validate($data['dropoff_info'], 'WeightTicketScale');
                } else {
                    $this->setEmptyValuesToNull($data['dropoff_info']);
                }
                if($weightticket->dropoff_id == null){ //no dropoff info yet, insert new dropoff info for this weight ticket
                    $weightticketscale_dropoff = new WeightTicketScale;
                    $data['dropoff_info']['type'] = 2; //for dropoff type
                    $weightticketscale_dropoff->fill($data['dropoff_info']);
                    $weightticketscale_dropoff->save();

                    foreach($data['dropoff_info']['products'] as $product){
                        $product['weightTicketScale_id'] = $weightticketscale_dropoff->id;
                        if($toBeClose){
                            $this->validate($product, 'WeightTicketProducts');
                        } else {
                            $this->setEmptyValuesToNullForProducts($product);
                        }
                        $weightticketproduct = new WeightTicketProducts;
                        $weightticketproduct->fill($product);
                        $weightticketproduct->save();
                    }

                    $weightticket->dropoff_id = $weightticketscale_dropoff->id;
                    $weightticket->save();
                } else {
                    $weightticketscale_dropoff = WeightTicketScale::find($weightticket->dropoff_id);
                    $weightticketscale_dropoff->fill($data['dropoff_info']);
                    $weightticketscale_dropoff->save();

                    foreach($data['dropoff_info']['products'] as $product){
                        $product['weightTicketScale_id'] = $weightticketscale_dropoff->id;
                        if($toBeClose){
                            $this->validate($product, 'WeightTicketProducts');
                        } else {
                            $this->setEmptyValuesToNullForProducts($product);
                        }
                        $weightticketproduct = WeightTicketProducts::find($product['id']);
                        $weightticketproduct->fill($product);
                        $weightticketproduct->save();
                    }
                }
            }

            return $weightticket->id;
        });
        
        if(is_array($result)){
            return $result;
        }

        return array(
              'error' => false,
              'message' => 'Weight ticket successfully updated');
    }
    
    public function destroy($transportSchedule_id)
    {
        $weightTicket = WeightTicket::where('transportSchedule_id', '=', $transportSchedule_id)->first();

        if($weightTicket){
            $weightTicket->delete();

            $response = array(
                'error' => false,
                'message' => 'Weight ticket successfully deleted.');
          } else {
            $response = array(
                'error' => true,
                'message' => "Weight ticket not found");
          }

        return $response;
    }
    

    public function validate($data, $entity){
          $validator = Validator::make($data, $entity::$rules);
          
          if($validator->fails()) { 
              throw new ValidationException($validator); 
          }
          
          return true;
    }
    
    public function instance($data = array())
    {
        return new WeightTicket($data);
    }

    /**
     * Mail Weight Ticket
     * 
     * @param type $id TransportSchedule id
     * @param array $recipients
     * @return type
     */
    public function mailWeightTicket($id, $recipients)
    {
        $recipients = array(
            array(
                "name" => "John Doe",
                "email" => "swfarm@mailinator.com"
            )
        );
        
        try
        {
            $transportSchedule_id = $id;
            $transportSchedule = TransportSchedule::find($transportSchedule_id);
            
            // Get order
            $order = Order::find($transportSchedule["order_id"]);
            
            // Get account
            $account = Account::find($order['account_id']);
            
            $weightticket = WeightTicket::
                with('weightticketscale_dropoff.weightticketproducts.transportscheduleproduct.productorder.product')
                ->with('weightticketscale_dropoff.scalerAccount')
                ->with('weightticketscale_dropoff.scale')
                ->with('weightticketscale_pickup.weightticketproducts.transportscheduleproduct.productorder.product')
                ->with('weightticketscale_pickup.scalerAccount')
                ->with('weightticketscale_pickup.scale')
                ->where('transportSchedule_id', '=', $transportSchedule_id)
                ->first();
            
            if ($weightticket) {
                foreach ($recipients as $recipient) {
                    if (isset($recipient['name'])) {
                        $header['recipient_name'] = $data['name'] = $recipient['name'];
                    }

                    $data = array(
                        'body' => 'Please see details of the Weight Ticket below.',
                        'weightticket' => $weightticket,
                        'order_number' => $order['order_number'],
                        'account_name' => $account['name']
                    );

                    // return View::make('emails.weightticket', $data);

                    $header = array(
                        'subject' => 'Weight Ticket',
                        'recipient_email' => $recipient['email'],
                        'sender_name' => '',
                        'sender_email' => ''
                    );

                    Mail::send('emails.weightticket', $data, function($message) use ($header)
                    {
                        if (isset($header['recipient_name'])) {
                            $message->from('donotreply@swfarm.com', 'Southwest Farm Admnistrator')
                                    ->to($header['recipient_email'], $header['recipient_name'])
                                    ->subject($header['subject']);
                        } else {
                            $message->from('donotreply@swfarm.com', 'Southwest Farm Admnistrator')
                                    ->to($header['recipient_email'])
                                    ->subject($header['subject']);
                        }
                    });
                }
            } else {
                return Response::json(array(
                    'error' => true,
                    'message' => 'Email was not sent.'), 200);
            }
            
            return Response::json(array(
              'error' => false,
              'message' => 'Email has been sent.'), 200);
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function closeWeightTicket($schedule_id)
    {
        try
        {
            $weightticketObj = WeightTicket::with('weightticketscale_dropoff.weightticketproducts')
                            ->with('weightticketscale_pickup.weightticketproducts')
                            ->where('transportSchedule_id', '=', $schedule_id)->first();

            if(!$weightticketObj) {
                throw new NotFoundException('Weight Info Not Found');
            } else if($weightticketObj->status_id == 2){ //already close
                return Response::json(array(
                      'error' => true,
                      'message' => 'This weight ticket is already close.'), 500);
            }
                
            $weightticket = $weightticketObj->toArray();
            $weightticket['status_id'] = '2'; //close
            //rename array to fit in update function
            if(isset($weightticket['weightticketscale_pickup'])){
                // $weightticket['pickup_info'] = $weightticket['weightticketscale_pickup'];
                // unset($weightticket['weightticketscale_pickup']);
                // if(isset($weightticket['pickup_info']['weightticketproducts'])){
                //     $weightticket['pickup_info']['products'] = $weightticket['pickup_info']['weightticketproducts'];
                //     unset($weightticket['pickup_info']['weightticketproducts']);
                // }

                if($weightticket['weightticketscale_pickup']['scaleAccount_id'] == null ||
                   $weightticket['weightticketscale_pickup']['scale_id'] == null || 
                   $weightticket['weightticketscale_pickup']['fee'] == null ||
                   $weightticket['weightticketscale_pickup']['bales'] == null ||
                   $weightticket['weightticketscale_pickup']['gross'] ==  null ||
                   $weightticket['weightticketscale_pickup']['tare'] == null){
                    return Response::json(array(
                      'error' => true,
                      'message' => 'Please complete all the details of pickup weight ticket before changing the status to close.'), 500);
                }

                if(count($weightticket['weightticketscale_pickup']['weightticketproducts']) > 1){ //require only if more than 1 product is in weight ticket
                    foreach($weightticket['weightticketscale_pickup']['weightticketproducts'] as $product){
                        if($product['bales'] == null || $product['pounds'] == null){
                            return Response::json(array(
                              'error' => true,
                              'message' => 'Please complete all the details of pickup weight ticket product details before you can change the status to close.'), 500);
                        }
                    }
                }
                
            }

            if(isset($weightticket['weightticketscale_dropoff'])){
                // $weightticket['dropoff_info'] = $weightticket['weightticketscale_dropoff'];
                // unset($weightticket['weightticketscale_dropoff']);
                // if(isset($weightticket['dropoff_info']['weightticketproducts'])){
                //     $weightticket['dropoff_info']['products'] = $weightticket['dropoff_info']['weightticketproducts'];
                //     unset($weightticket['dropoff_info']['weightticketproducts']);
                // }

                if($weightticket['weightticketscale_dropoff']['scaleAccount_id'] == null ||
                   $weightticket['weightticketscale_dropoff']['scale_id'] == null || 
                   $weightticket['weightticketscale_dropoff']['fee'] == null ||
                   $weightticket['weightticketscale_dropoff']['bales'] == null ||
                   $weightticket['weightticketscale_dropoff']['gross'] ==  null ||
                   $weightticket['weightticketscale_dropoff']['tare'] == null){
                    return Response::json(array(
                      'error' => true,
                      'message' => 'Please complete all the details of dropoff weight ticket before changing the status to close.'), 500);
                }

                if(count($weightticket['weightticketscale_dropoff']['weightticketproducts']) > 1){ //require only if more than 1 product is in weight ticket
                    foreach($weightticket['weightticketscale_dropoff']['weightticketproducts'] as $product){
                        if($product['bales'] == null || $product['pounds'] == null){
                            return Response::json(array(
                              'error' => true,
                              'message' => 'Please complete all the details of dropoff weight ticket product details before you can change the status to close.'), 500);
                        }
                    }
                }
            }
            
            //change the status
            $weightticketObj->status_id = 2; //close status
            $weightticketObj->save();
            return Response::json(array(
              'error' => false,
              'message' => 'Weighticket successfully close.'), 200);
            // return $weightticket;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
}
