<?php

class WeightTicketRepository implements WeightTicketRepositoryInterface {
    
    public function findAll()
    {
        // try
        // {
        //     return WeightTicket::all();
        // }
        // catch (Exception $e)
        // {
        //     return $e->getMessage();
        // }
    }
    
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
                            ->where('transportSchedule_id', '=', $schedule_id)->get();

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
            //for pickup data
            $this->validate($data['pickup_info'], 'WeightTicketScale');
            $weightticketscale_pickup = new WeightTicketScale;
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

            
            // $data['weightTicketNumber'] = $this->generateWeightTicketNumber();
            // $data['loadingTicketNumber'] = $this->generateLoadingTicketNumber();
            // $data['pickup_id'] = $weightticketscale_pickup->id;
            // $data['dropoff_id'] = $weightticketscale_dropoff->id;

            

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
        $weightTicket = WeightTicket::where('transportSchedule_id', '=', $transportSchedule_id);

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

    
}
