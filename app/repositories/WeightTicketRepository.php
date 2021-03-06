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
                            ->with('weightticketscale_dropoff.document')
                            ->with('weightticketscale_pickup.weightticketproducts.transportscheduleproduct.productorder.product')
                            ->with('weightticketscale_pickup.scalerAccount')
                            ->with('weightticketscale_pickup.scale')
                            ->with('weightticketscale_pickup.document')
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
                if(isset($result['data']['error']) && $result['data']['error']){
                    return $result['data'];
                } else if(isset($data['object_id'])){ // mobile request
                    return $result;
                } else { // web request
                    return array(
                      'error' => false,
                      'message' => 'Weight ticket successfully created');
                }
            }
        }


        $result = DB::transaction(function() use ($data){

            if(isset($data['object_id']))
            {
                $isMobile = true;
            }
            else
            {
                $isMobile = false;
            }
            
            $isPickup = false;
            $isDropoff = false;
            //do not required fields if not to be close
            $toBeClose = false;
            if(isset($data['status_id'])){
                if($data['status_id'] == 2){ //close status
                    $toBeClose =  true;
                }
            }

            //check if net is equal to total weight of products
            if(!$this->isNetWeightIsEqualToTotalProductWeight($data)){
                return array(
                  'error' => true,
                  'message' => 'Net Lbs. and total Lbs. of all products are not equal.');
            }

            $mobileData = array();

            if($isMobile){
                $mobileData['object_id'] = $data['object_id'];
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
                
                if($isMobile)
                {
                    $mobileData['pickup_info'] = array_merge(['object_id' => $data['pickup_info']['object_id']],$weightticketscale_pickup->toArray());
                }

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

                    if($isMobile)
                    {
                        $pickup_info_product[] = array_merge(['object_id' => $product['object_id']],$weightticketproduct->toArray());
                    }
                }
                if($isMobile)
                {
                    $mobileData['pickup_info']['product'] = $pickup_info_product;
                }

                $isPickup = true;

                if(isset($data['pickup_info']['uploadedfile']) && !empty($data['pickup_info']['uploadedfile'])){
                    $this->linkUploadDocumentToWeightTicketScale($data['pickup_info']['uploadedfile'], $weightticketscale_pickup->id);
                }
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

                if($isMobile)
                {
                    $mobileData['dropoff_info'] = array_merge(['object_id' => $data['dropoff_info']['object_id']],$weightticketscale_dropoff->toArray());
                }

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

                    if($isMobile)
                    {
                        $dropoff_info_product[] = array_merge(['object_id' => $product['object_id']],$weightticketproduct->toArray());
                    }

                }

                if($isMobile)
                {
                    $mobileData['dropoff_info']['product'] = $dropoff_info_product;
                }

                $isDropoff = true;

                if(isset($data['dropoff_info']['uploadedfile']) && !empty($data['dropoff_info']['uploadedfile'])){
                    $this->linkUploadDocumentToWeightTicketScale($data['dropoff_info']['uploadedfile'], $weightticketscale_dropoff->id);
                }
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

            if(isset($data['object_id'])){
                return array_merge($weightticket->toArray(),$mobileData);
            }

            return $weightticket->id;


        });

        if(isset($data['object_id']))
        {
            return array(
               'error' => false,
               'data' => $result
            );
        }

        if(is_array($result)){
            return $result; 
        }

        return array(
              'error' => false,
              'message' => 'Weight Ticket successfully created');
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
            if(isset($data['object_id'])){
                $isMobile = true;
            } else {
                $isMobile = false;
            }

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
                  'error' => true,
                  'message' => 'You cannot edit a Weight Ticket that was already closed.');
            }

            //check if net is equal to total weight of products
            if(!$this->isNetWeightIsEqualToTotalProductWeight($data)){
                return array(
                  'error' => true,
                  'message' => 'Net Lbs. and total Lbs. of all products are not equal.');
            }

            $weightticket->fill($data);
            $weightticket->save();

            $mobileData = array();

            if($isMobile){
                $mobileData['object_id'] = $data['object_id'];
            }

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

                    if($isMobile){
                        $mobileData['pickup_info'] = array_merge(['object_id' => $data['pickup_info']['object_id']],$weightticketscale_pickup->toArray());
                    }

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

                        if($isMobile){
                            $pickup_info_product[] = array_merge(['object_id' => $product['object_id']],$weightticketproduct->toArray());
                        }
                    }

                    $weightticket->pickup_id = $weightticketscale_pickup->id;
                    $weightticket->save();

                    if($isMobile){
                        $mobileData['pickup_info']['product'] = $pickup_info_product;
                    }
                } else {
                    $weightticketscale_pickup = WeightTicketScale::find($weightticket->pickup_id);
                    $weightticketscale_pickup->fill($data['pickup_info']);
                    $weightticketscale_pickup->save();

                    if($isMobile)
                    {
                        $mobileData['pickup_info'] = array_merge(['object_id' => $data['pickup_info']['object_id']],$weightticketscale_pickup->toArray());
                    }

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

                        if($isMobile){
                            $pickup_info_product[] = array_merge(['object_id' => $product['object_id']],$weightticketproduct->toArray());
                        }
                    }
                    if($isMobile){
                        $mobileData['pickup_info']['product'] = $pickup_info_product;
                    }
                }

                if(isset($data['pickup_info']['uploadedfile']) && !empty($data['pickup_info']['uploadedfile'])){
                    $this->linkUploadDocumentToWeightTicketScale($data['pickup_info']['uploadedfile'], $weightticketscale_pickup->id);
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

                    if($isMobile){
                        $mobileData['dropoff_info'] = array_merge(['object_id' => $data['dropoff_info']['object_id']],$weightticketscale_dropoff->toArray());
                    }

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

                        if($isMobile){
                            $dropoff_info_product[] = array_merge(['object_id' => $product['object_id']],$weightticketproduct->toArray());
                        }
                    }

                    $weightticket->dropoff_id = $weightticketscale_dropoff->id;
                    $weightticket->save();

                    if($isMobile){
                        $mobileData['dropoff_info']['product'] = $dropoff_info_product;
                    }
                } else {
                    $weightticketscale_dropoff = WeightTicketScale::find($weightticket->dropoff_id);
                    $weightticketscale_dropoff->fill($data['dropoff_info']);
                    $weightticketscale_dropoff->save();

                    if($isMobile){
                        $mobileData['dropoff_info'] = array_merge(['object_id' => $data['dropoff_info']['object_id']],$weightticketscale_dropoff->toArray());
                    }

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

                        if($isMobile){
                            $dropoff_info_product[] = array_merge(['object_id' => $product['object_id']],$weightticketproduct->toArray());
                        }
                    }

                    if($isMobile){
                        $mobileData['dropoff_info']['product'] = $dropoff_info_product;
                    }
                }

                if(isset($data['dropoff_info']['uploadedfile']) && !empty($data['dropoff_info']['uploadedfile'])){
                    $this->linkUploadDocumentToWeightTicketScale($data['dropoff_info']['uploadedfile'], $weightticketscale_dropoff->id);
                }
            }

            if($isMobile){
                return array_merge($weightticket->toArray(),$mobileData);
            } else {
                return $weightticket->id;    
            }
            
        });

        if(isset($data['object_id'])) //from mobile device
        {
            return array(
               'error' => false,
               'data' => $result
            );
        }

        if(is_array($result)){
            return $result;
        }

        return array(
              'error' => false,
              'message' => 'Weight Ticket successfully updated');
    }

    public function destroy($transportSchedule_id)
    {
        $weightTicket = WeightTicket::where('transportSchedule_id', '=', $transportSchedule_id)->first();

        if($weightTicket){
            $weightTicket->delete();

            $response = array(
                'error' => false,
                'message' => 'Weight Ticket successfully deleted.');
          } else {
            $response = array(
                'error' => true,
                'message' => "Weight Ticket not found");
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
     * @param array $data
     * @return type
     */
    public function mailWeightTicket($id, $data)
    {
        try
        {
            $transportSchedule_id = $id;
            $transportSchedule = TransportSchedule::find($transportSchedule_id);

            $contact_trucker = Contact::find($transportSchedule->trucker_id);

            if ($transportSchedule->originloader_id == $transportSchedule->destinationloader_id) {
                $contact_loader = Contact::find($transportSchedule->destinationloader_id);
            } else {
                $contact_loader_origin = Contact::find($transportSchedule->originloader_id);
                $contact_loader_destination = Contact::find($transportSchedule->destinationloader_id);
            }

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

            // Get Contacts
//            $recipients = array(
//                array(
//                    "name" => "John Doe",
//                    "email" => "swfarm@mailinator.com"
//                )
//            );

            // Add additional recipients
            $emails = explode(',', preg_replace( '/\s+/', '', $data['recipients']));
            foreach ($emails as $email) {
                $recipients[] = array(
                    "email" => $email
                );
            }

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

                    Mail::send(array('html' => 'emails.weightticket'), $data, function($message) use ($header)
                    {
                        $message->from('donotreply@swfarm.com', 'Southwest Farm Admnistrator');
                        if (isset($header['recipient_name'])) {
                            $message->to($header['recipient_email'], $header['recipient_name']);
                        } else {
                            $message->to($header['recipient_email']);
                        }
                        $message->subject($header['subject']);
                    });
                }
            } else {
                return Response::json(array(
                    'error' => true,
                    'message' => 'Email was not sent.'), 200);
            }

            return Response::json(array(
              'error' => false,
              'message' => 'Weight Ticket was sent.'), 200);
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }


    private function checkOrderLocation($scheduleId){
        $order = Order::with('location')->whereHas('transportschedule', function($query) use ($scheduleId){
            $query->where('id', '=', $scheduleId);
        })->first(array('id', 'location_id'));

        if($order){
            $order = $order->toArray();
            return $order['location']['id'];

        } else {
            return false;
        }
    }

    private function getScheduleOrderType($scheduleId){
        $order = Order::whereHas('transportschedule', function($query) use ($scheduleId){
                            $query->where('id', '=', $scheduleId);
        })->first(array('ordertype'));

        return intval($order['ordertype']); //if 1 - PO, if 2 - SO
    }


    private function createJsonForInventory($schedule_id, $ordertype = 1){ //order type is default to PO
        if($ordertype == 1){
            $transactiontype_id = 2; //PO on inventory type
        } else {
            $transactiontype_id = 1; //SO  on inventory type
        }
        $transportSchedule = TransportSchedule::with('weightticket.weightticketscale_dropoff.weightticketproducts.transportscheduleproduct.productorder')
                                            ->with('weightticket.weightticketscale_pickup.weightticketproducts.transportscheduleproduct.productorder')
                                            ->where('id', '=', $schedule_id)->first();

        $transportSchedule = $transportSchedule->toArray();
        // return Response::json($transportSchedule);
        if($ordertype == 1){ //if PO
            if($transportSchedule['weightticket']['dropoff_id'] != null){
                $weightticketscale = $transportSchedule['weightticket']['weightticketscale_dropoff'];
            } else if($transportSchedule['weightticket']['pickup_id'] != null){
                $weightticketscale = $transportSchedule['weightticket']['weightticketscale_pickup'];
            }
        } else { //if SO, SO has always have pick up schedule before calling this method
            $weightticketscale = $transportSchedule['weightticket']['weightticketscale_pickup'];
        }

        $ctr = 0;
        foreach($weightticketscale['weightticketproducts'] as $product){
            $productTemp[$ctr]['tons'] = $product['pounds'] * 0.0005;
            $productTemp[$ctr]['stacknumber'] = $product['transportscheduleproduct']['productorder']['stacknumber'];
            $productTemp[$ctr]['product_id'] = $product['transportscheduleproduct']['productorder']['product_id'];
            if($ordertype == Config::get('constants.ORDERTYPE_SO')){ //if SO, get the unitprice from PO
                $unitprice = $this->getUnitPriceUsingStackNumber($product['transportscheduleproduct']['productorder']['stacknumber']);
                if($unitprice != null){
                    $productTemp[$ctr]['price'] = $unitprice;
                } else {
                    $productTemp[$ctr]['price'] = $product['transportscheduleproduct']['productorder']['unitprice'];
                }
            } else {
                $productTemp[$ctr]['price'] = $product['transportscheduleproduct']['productorder']['unitprice'];    
            }
            $productTemp[$ctr]['bales'] = $product['bales'];
            $productTemp[$ctr]['sectionto_id'] = $product['transportscheduleproduct']['sectionto_id'];
            $productTemp[$ctr]['sectionfrom_id'] = $product['transportscheduleproduct']['productorder']['section_id'];
            $ctr++;
        }

        $products = array("transactiontype_id" => $transactiontype_id, "order_id" =>$transportSchedule['order_id'], "weightticket_id" => $transportSchedule['weightticket']['id'], "products" => $productTemp, "notes" => "");

        // return Response::json($products);
        return $products;
    }

    public function getUnitPriceUsingStackNumber($stacknumber){
        $result = Stack::where('stacknumber', 'like', $stacknumber)->first(array('id', 'unitprice'))->toArray();
        if(count($result) > 0){
            return $result['unitprice'];
        } else {
            return null;
        }
    }

    public function checkoutWeightTicket($schedule_id){
        $weightticketObj = WeightTicket::where('transportSchedule_id', '=', $schedule_id)->first();
        if(!$weightticketObj) {
            return Response::json(array(
                  'error' => true,
                  'message' => 'Weight Ticket Not Found.'), 500);
        } else if($weightticketObj->checkout == 1){ //already checkout
            return Response::json(array(
                  'error' => true,
                  'message' => 'This Weight Ticket was already checked out.'), 500);
        } else if($weightticketObj->pickup_id == null){
            return Response::json(array(
                  'error' => true,
                  'message' => 'This Weight Ticket has no pickup details yet.'), 500);
        } else {
            $weightticket = $weightticketObj->toArray();

            if(isset($weightticket['weightticketscale_pickup'])){

                if($weightticket['weightticketscale_pickup']['scaleAccount_id'] == null ||
                   $weightticket['weightticketscale_pickup']['scale_id'] == null ||
                   $weightticket['weightticketscale_pickup']['fee'] == null ||
                   $weightticket['weightticketscale_pickup']['bales'] == null ||
                   $weightticket['weightticketscale_pickup']['gross'] ==  null ||
                   $weightticket['weightticketscale_pickup']['tare'] == null){
                    return Response::json(array(
                      'error' => true,
                      'message' => 'Please complete all the details of pickup weight ticket before checking out.'), 500);
                }

                if(count($weightticket['weightticketscale_pickup']['weightticketproducts']) > 1){ //require only if more than 1 product is in weight ticket
                    foreach($weightticket['weightticketscale_pickup']['weightticketproducts'] as $product){
                        if($product['bales'] == null || $product['pounds'] == null){
                            return Response::json(array(
                              'error' => true,
                              'message' => 'Please complete all the details of pickup weight ticket product details before checking out.'), 500);
                        }
                    }
                }

            }

            $dataInventory = $this->createJsonForInventory($schedule_id, 2); //set order type to SO
            $inventoryResponse = InventoryLibrary::store($dataInventory);
            if($inventoryResponse['error']){
                return Response::json($inventoryResponse);
            }

            //change the status
            $weightticketObj->checkout = 1;
            $weightticketObj->save();
            return Response::json(array(
              'error' => false,
              'message' => 'Weight Ticket successfully checkout.'), 200);


        }
    }

    public function closeWeightTicket($schedule_id)
    {
        // var_dump($this->checkOrderLocation($schedule_id));exit;
/*
        $products = array();
        $product1 = array("stacknumber" => "Prod-1x", "product_id" => "1", "tons" => "200", "price"=>"10.50","sectionfrom_id"=>"", "sectionto_id"=>"1");
        $product2 = array("stacknumber" => "Prod-2x", "product_id" => "2", "tons" => "201", "price"=>"11.50","sectionfrom_id"=>"", "sectionto_id"=>"1");
        array_push($products, $product1);
        array_push($products, $product2);
        $inventoryData = array("transactiontype_id" => "5", "products" => $products, "notes"=>"test");

        InventoryLibrary::store($inventoryData);

        exit;*/
        // return $this->createJsonForInventory($schedule_id);
        // exit;
        // return Response::json($this->getScheduleOrderType($schedule_id));
        try
        {
            $orderType = $this->getScheduleOrderType($schedule_id);
            $weightticketObj = WeightTicket::with('weightticketscale_dropoff.weightticketproducts')
                            ->with('weightticketscale_pickup.weightticketproducts')
                            ->where('transportSchedule_id', '=', $schedule_id)->first();

            if(!$weightticketObj) {
                throw new NotFoundException('Weight Info Not Found');
            } else if($weightticketObj->status_id == 2){ //already close
                return Response::json(array(
                      'error' => true,
                      'message' => 'This Weight Ticket was already closed.'), 500);
            } else if($orderType == 2 && $weightticketObj->checkout != 1){ //SO is not checkout yet
                return Response::json(array(
                      'error' => true,
                      'message' => 'Weight Ticket has not been checkout from the inventory yet.'), 500);
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
                      'message' => 'Please complete all the details of pickup weight ticket before changing the status to closed.'), 500);
                }

                if(count($weightticket['weightticketscale_pickup']['weightticketproducts']) > 1){ //require only if more than 1 product is in weight ticket
                    foreach($weightticket['weightticketscale_pickup']['weightticketproducts'] as $product){
                        if($product['bales'] == null || $product['pounds'] == null){
                            return Response::json(array(
                              'error' => true,
                              'message' => 'Please complete all the details of pickup weight ticket product details before you can change the status to closed.'), 500);
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
                      'message' => 'Please complete all the details of dropoff weight ticket before changing the status to closed.'), 500);
                }

                if(count($weightticket['weightticketscale_dropoff']['weightticketproducts']) > 1){ //require only if more than 1 product is in weight ticket
                    foreach($weightticket['weightticketscale_dropoff']['weightticketproducts'] as $product){
                        if($product['bales'] == null || $product['pounds'] == null){
                            return Response::json(array(
                              'error' => true,
                              'message' => 'Please complete all the details of dropoff weight ticket product details before you can change the status to closed.'), 500);
                        }
                    }
                }
            }

            if($orderType == 1){ //for PO only
                $dataInventory = $this->createJsonForInventory($schedule_id);
                $inventoryResponse = InventoryLibrary::store($dataInventory);
                if($inventoryResponse['error']){
                    return Response::json($inventoryResponse);
                }
            }


            //change the status
            $weightticketObj->status_id = 2; //close status
            $weightticketObj->save();

            // automatically close the schedule when closing ticket
            $transportSchedule = TransportSchedule::find($schedule_id);
            $transportSchedule->status_id = 2;
            $transportSchedule->save();

            return Response::json(array(
              'error' => false,
              'message' => 'Weight Ticket successfully closed.'), 200);
            // return $weightticket;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    public function isNetWeightIsEqualToTotalProductWeight($data){
        if(isset($data['pickup_info'])){
            $weightticket = $data['pickup_info'];
        } else {
            $weightticket = $data['dropoff_info'];
        }

        # $netWeight = $weightticket['gross']-$weightticket['tare']; // old as of 16-April-2015
        $netWeight = ($weightticket['gross']-$weightticket['tare']) * 0.0005; // new as of 16-April-2015
        $totalProductWeightInPounds = 0;  
        foreach ($weightticket['products'] as $product) {
            $totalProductWeightInPounds += $product['pounds'];
        }

        $totalProductWeightInTons = $totalProductWeightInPounds * 0.0005;
        //formatting
        $netWeight = number_format($netWeight, 4);
        $totalProductWeightInTons = number_format($totalProductWeightInTons, 4);
        // var_dump($netWeight);
        // var_dump($totalProductWeightInTons);
        // var_dump($netWeight == $totalProductWeightInTons);

        return $netWeight == $totalProductWeightInTons; 


    }

    /**
     * Mail loading ticket.
     *
     * @param type $id
     * @param type $data
     * @return type
     */
    public function mailLoadingTicket($id, $data)
    {
        try
        {
            // Get Transport Schedule
            $transportSchedule = TransportSchedule::find($id);
            if (!$transportSchedule) {
                throw new NotFoundException('Transport Schedule not found.', 404);
            }

            // Get Trucker Account, Truck #, and Truck Driver
            $driver = Contact::with('account')
                ->where('id', '=', $transportSchedule->trucker_id)
                ->first();
            if (!$driver) {
                throw new NotFoundException('Driver not found.', 404);
            }
            $trucker = Account::find($driver['account']);

            // Get Loaders
            if ($transportSchedule->originloader_id) {
                $contact_loader_origin = Contact::find($transportSchedule->originloader_id);
            }
            if ($transportSchedule->destinationloader_id) {
                $contact_loader_destination = Contact::find($transportSchedule->destinationloader_id);
            }

            // Get Order
            $order = Order::find($transportSchedule["order_id"]);
            if (!$order) {
                throw new NotFoundException('Order not found.', 404);
            }

            // Get Customer
            $account = Account::with('address')
                ->where('id', '=', $order['account_id'])
                ->first();
            if (!$account) {
                throw new NotFoundException('Account not found.', 404);
            }

            // Get Weight Ticket
            $weightticket = WeightTicket::
                with('weightticketscale_dropoff')
                ->with('weightticketscale_pickup')
                ->where('transportSchedule_id', '=', $id)
                ->first();
            if (!$weightticket) {
                throw new NotFoundException('Weight Ticket not found.', 404);
            }

            // Get Contacts
//            $recipients = array(
//                array(
//                    "name" => "John Doe",
//                    "email" => "swfarm@mailinator.com"
//                )
//            );

            // Add additional recipients
            $emails = explode(',', preg_replace( '/\s+/', '', $data['recipients']));
            foreach ($emails as $email) {
                $recipients[] = array(
                    "email" => $email
                );
            }

            if ($weightticket) {
                foreach ($recipients as $recipient) {
                    if (isset($recipient['name'])) {
                        $header['recipient_name'] = $data['name'] = $recipient['name'];
                    }

                    $data = array(
                        'body' => 'Please see details of the Loading Ticket below.',
                        'weightticket' => $weightticket,
                        'order_number' => $order['order_number'],
                        'account_name' => $account['name'],
                        'address' => $account['address'],
                        'account_phone' => $account['phone'],
                        'loader_origin' => $contact_loader_origin['id'] ? ($contact_loader_origin['firstname'] .' '  .$contact_loader_origin['lastname']) : '',
                        'loader_origin_fee' => $transportSchedule->originloaderfee,
                        'loader_destination' => $contact_loader_destination['id'] ? ($contact_loader_destination['firstname'] .' '  .$contact_loader_destination['lastname']) : '',
                        'loader_destination_fee' => $transportSchedule->destinationloaderfee,
                        'driver' => $driver['firstname'] . ' ' .$driver['lastname'],
                        'trucker' => $trucker->name
                    );

                    // return View::make('emails.loadingticket', $data);

                    $header = array(
                        'subject' => 'Weight Ticket',
                        'recipient_email' => $recipient['email'],
                        'sender_name' => '',
                        'sender_email' => ''
                    );

                    Mail::send(array('html' => 'emails.loadingticket'), $data, function($message) use ($header)
                    {
                        $message->from('donotreply@swfarm.com', 'Southwest Farm Admnistrator');
                        if (isset($header['recipient_name'])) {
                            $message->to($header['recipient_email'], $header['recipient_name']);
                        } else {
                            $message->to($header['recipient_email']);
                        }
                        $message->subject($header['subject']);
                    });
                }
            } else {
                return Response::json(array(
                    'error' => true,
                    'message' => 'Email was not sent.'), 200);
            }

//            $response = array(
//                'error' => false,
//                'message' => 'Loading Ticket has been sent.',
//                'data' => array(
//                    'transportSchedule' => $transportSchedule->toArray(),
//                    'driver' => $driver->toArray(),
//                    'customer' => $account->toArray(),
//                    'loader_origin' => $contact_loader_origin->toArray(),
//                    'loader_destination' => $contact_loader_destination->toArray(),
//                    'weightticket' => $weightticket->toArray()
//                )
//            );

            $response = Response::json(array(
              'error' => false,
              'message' => 'Loading Ticket was sent.'), 200);

            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }

    private function linkUploadDocumentToWeightTicketScale($uploadedfile, $weightTicketScaleId)
    {
        $wts = WeightTicketScale::find($weightTicketScaleId);
        if($wts)
        {
            if($wts->document)
            {
                if($wts->document->id != $uploadedfile)
                {
                    $wts->document->delete();

                    if(!empty($uploadedfile)) {
                        $file = Document::find($uploadedfile);
                        $file->issave = 1;
                        $file->documentable_id = $wts->id;
                        $file->documentable_type = get_class($wts);
                        $file->save();
                    }
                }
            } else {
                $file = Document::find($uploadedfile);
                $file->issave = 1;
                $file->documentable_id = $wts->id;
                $file->documentable_type = get_class($wts);
                $file->save();
            }
        }
    }

}
