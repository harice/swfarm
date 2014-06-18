<?php

class WeightTicketRepository implements WeightTicketRepositoryInterface {
    

    public function findById($schedule_id)
    {
        try
        {
            $weightticket = WeightTicket::with('weightticketscale_dropoff.weightticketproducts.transportscheduleproduct.productorder.product')
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
    
    public function store($data)
    {
        $result = DB::transaction(function() use ($data){
            $isPickup = false;
            $isDropoff = false;
            $hasExisitingTicket = WeightTicket::where('transportSchedule_id', '=', $data['transportSchedule_id'])->first();
            if($hasExisitingTicket != null){
                return array(
                      'error' => true,
                      'message' => 'This schedule has already weight ticket.');
            }
            if(isset($data['pickup_info'])){
                //for pickup data
                $this->validate($data['pickup_info'], 'WeightTicketScale');
                $weightticketscale_pickup = new WeightTicketScale;
                $data['pickup_info']['type'] = 1; //for pickup type
                $weightticketscale_pickup->fill($data['pickup_info']);
                $weightticketscale_pickup->save();

                foreach($data['pickup_info']['products'] as $product){
                    $product['weightTicketScale_id'] = $weightticketscale_pickup->id;
                    $this->validate($product, 'WeightTicketProducts');
                    $weightticketproduct = new WeightTicketProducts;
                    $weightticketproduct->fill($product);
                    $weightticketproduct->save();
                }
                $isPickup = true;
            }

            if(isset($data['dropoff_info'])){
                //for dropoff data
                $this->validate($data['dropoff_info'], 'WeightTicketScale');
                $weightticketscale_dropoff = new WeightTicketScale;
                $data['dropoff_info']['type'] = 2; //for dropoff type
                $weightticketscale_dropoff->fill($data['dropoff_info']);
                $weightticketscale_dropoff->save();

                foreach($data['dropoff_info']['products'] as $product){
                    $product['weightTicketScale_id'] = $weightticketscale_dropoff->id;
                    $this->validate($product, 'WeightTicketProducts');
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
            $data['status_id'] = 1; //open status
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

            $this->validate($data, 'WeightTicket');
            $weightticket = WeightTicket::find($id);
            $weightticket->fill($data);
            $weightticket->save();
            if(isset($data['pickup_info'])){
                //for pickup data
                $this->validate($data['pickup_info'], 'WeightTicketScale');
                if($weightticket->pickup_id == null){ //no pickup info yet, insert new pickup info for this weight ticket
                    $weightticketscale_pickup = new WeightTicketScale;
                    $data['pickup_info']['type'] = 1; //for pickup type
                    $weightticketscale_pickup->fill($data['pickup_info']);
                    $weightticketscale_pickup->save();

                    foreach($data['pickup_info']['products'] as $product){
                        $product['weightTicketScale_id'] = $weightticketscale_pickup->id;
                        $this->validate($product, 'WeightTicketProducts');
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
                        $this->validate($product, 'WeightTicketProducts');
                        $weightticketproduct = WeightTicketProducts::find($product['id']);
                        $weightticketproduct->fill($product);
                        $weightticketproduct->save();
                    }
                }

                
            }

            if(isset($data['dropoff_info'])){
                //for dropoff data
                $this->validate($data['dropoff_info'], 'WeightTicketScale');
                if($weightticket->dropoff_id == null){ //no dropoff info yet, insert new dropoff info for this weight ticket
                    $weightticketscale_dropoff = new WeightTicketScale;
                    $data['dropoff_info']['type'] = 2; //for dropoff type
                    $weightticketscale_dropoff->fill($data['dropoff_info']);
                    $weightticketscale_dropoff->save();

                    foreach($data['dropoff_info']['products'] as $product){
                        $product['weightTicketScale_id'] = $weightticketscale_dropoff->id;
                        $this->validate($product, 'WeightTicketProducts');
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
                        $this->validate($product, 'WeightTicketProducts');
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

    public function closeWeightTicket($transportSchedule_id){
        $weightTicket = WeightTicket::where('transportSchedule_id', '=', $transportSchedule_id)->first();
        
        if($weightTicket->status_id == 1){ //check if Open
              $weightTicket->status_id = 2;
              $weightTicket->save();

              return array(
                  'error' => false,
                  'message' => 'Weight ticket closed.');
        } else if($weightTicket->status_id == 2) {//if close
              return array(
                  'error' => false,
                  'message' => 'Weight ticket is already closed.');
        } else {
              return array(
                  'error' => false,
                  'message' => 'Weight ticket cannot be cancel if the status is not open or pending.');
        }       
    }

    public function mailWeightTicket($id, $recipients)
    {
        try
        {
            // Transport Schedule
            $_weightticket = WeightTicket::find($id);
            $transportSchedule_id = $_weightticket['transportSchedule_id'];
            
            $transportSchedule = TransportSchedule::find($transportSchedule_id);
            Log::debug($transportSchedule);
            
            $order = Order::find($transportSchedule["order_id"]);
            Log::debug($order);
            
            $account = Account::find($order['account_id']);
            Log::debug($account);
            
            $weightticket = WeightTicket::with('weightticketscale_dropoff.weightticketproducts.transportscheduleproduct.productorder.product')
                            ->with('weightticketscale_dropoff.scalerAccount')
                            ->with('weightticketscale_dropoff.scale')
                            ->with('weightticketscale_pickup.weightticketproducts.transportscheduleproduct.productorder.product')
                            ->with('weightticketscale_pickup.scalerAccount')
                            ->with('weightticketscale_pickup.scale')
                            ->where('transportSchedule_id', '=', $transportSchedule_id)->first();
            
            foreach ($recipients as $recipient) {
                $data = array(
                    'name' => $recipient['name'],
                    'body' => 'Please see details of the Weight Ticket below.',
                    'weightticket' => $weightticket,
                    'order_number' => $order['order_number'],
                    'account_name' => $account['name']
                );
                
                return View::make('emails.weightticket', $data);
                
                $header = array(
                    'subject' => 'Weight Ticket',
                    'recipient_name' => $recipient['name'],
                    'recipient_email' => $recipient['email'],
                    'sender_name' => '',
                    'sender_email' => ''
                );

                $sent = Mail::send('emails.weightticket', $data, function($message) use ($header)
                {
                    $message->to($header['recipient_email'], $header['recipient_name'])
                            ->subject($header['subject']);
                });

                if (!$sent) {
                    return 'Email was not sent.';
                }
            }
            
            return 'Email has been sent.';
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
}
