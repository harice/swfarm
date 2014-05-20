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
    
    public function findById($id)
    {
        // try
        // {
        //     $weightticket = WeightTicket::find($id);

        //     if(!$weightticket) throw new NotFoundException('Weight Info Not Found');
        //     return $weightticket;
        // }
        // catch (Exception $e)
        // {
        //     return $e->getMessage();
        // }
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
    
    public function update($id, $data)
    {
        // $this->validate($data);
        
        // try
        // {
        //     $weightticket = WeightTicket::find($id);
            
        //     $weightticket->purchaseorder_id = $data['purchaseorder_id'];
        //     $weightticket->transportschedule_id = $data['transportschedule_id'];
        //     $weightticket->bidproduct_id = $data['bidproduct_id'];
            
        //     $weightticket->origin_bales = $data['origin_bales'];
        //     $weightticket->origin_gross = $data['origin_gross'];
        //     $weightticket->origin_tare = $data['origin_tare'];
        //     $weightticket->origin_net = $data['origin_net'];
        //     $weightticket->origin_account_id = $data['origin_account_id'];
        //     $weightticket->origin_scale_fee = $data['origin_scale_fee'];
            
        //     $weightticket->destination_bales = $data['destination_bales'];
        //     $weightticket->destination_gross = $data['destination_gross'];
        //     $weightticket->destination_tare = $data['destination_tare'];
        //     $weightticket->destination_net = $data['destination_net'];
        //     $weightticket->destination_account_id = $data['destination_account_id'];
        //     $weightticket->destination_scale_fee = $data['destination_scale_fee'];
            
        //     $weightticket->save();
            
        //     return $weightticket;
        // }
        // catch (Exception $e)
        // {
        //     return $e->getMessage();
        // }
    }
    
    public function destroy($id)
    {
        // $role = $this->findById($id);
        // return $role->delete();
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
