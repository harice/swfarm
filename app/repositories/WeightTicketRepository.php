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
            $hasExisitingTicket = WeightTicket::where('transportSchedule_id', '=', $data['transportSchedule_id'])->first();
            if($hasExisitingTicket != null){
                return array(
                      'error' => true,
                      'message' => 'This schedule has already weight ticket.');
            }
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

            $this->validate($data, 'WeightTicket');
            $data['weightTicketNumber'] = $this->generateWeightTicketNumber();
            $data['loadingTicketNumber'] = $this->generateLoadingTicketNumber();
            $data['pickup_id'] = $weightticketscale_pickup->id;
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

    private function generateWeightTicketNumber(){ //type default is PO
        $prefix = 'W';

        $dateToday = date('Y-m-d');
        $count = WeightTicket::where('created_at', 'like', $dateToday.'%')->count()+1;
        
        return $prefix.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }

    private function generateLoadingTicketNumber(){ //type default is PO
        $prefix = 'L';

        $dateToday = date('Y-m-d');
        $count = WeightTicket::where('created_at', 'like', $dateToday.'%')->count()+1;
        
        return $prefix.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
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

            //for pickup data
            $this->validate($data['pickup_info'], 'WeightTicketScale');
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

            //for dropoff data
            $this->validate($data['dropoff_info'], 'WeightTicketScale');
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
            // Get weight ticket
            $_weightticket = WeightTicket::find($id);
            
            // Get transport schedule
            $transportSchedule_id = $_weightticket['transportSchedule_id'];
            $transportSchedule = TransportSchedule::find($transportSchedule_id);
            
            // Get order
            $order = Order::find($transportSchedule["order_id"]);
            
            // Get account
            $account = Account::find($order['account_id']);
            
            $weightticket = WeightTicket::with('weightticketscale_dropoff.weightticketproducts.transportscheduleproduct.productorder.product')
                            ->with('weightticketscale_dropoff.scalerAccount')
                            ->with('weightticketscale_dropoff.scale')
                            ->with('weightticketscale_pickup.weightticketproducts.transportscheduleproduct.productorder.product')
                            ->with('weightticketscale_pickup.scalerAccount')
                            ->with('weightticketscale_pickup.scale')
                            ->where('transportSchedule_id', '=', $transportSchedule_id)->first();
            
            foreach ($recipients as $recipient) {
                Log::debug($recipient);
                $data = array(
                    'name' => $recipient['name'],
                    'body' => 'Please see details of the Weight Ticket below.',
                    'weightticket' => $weightticket,
                    'order_number' => $order['order_number'],
                    'account_name' => $account['name']
                );
                
                Log::debug($data);
                $result = View::make('emails.weightticket', $data);
                return $result;
                
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
