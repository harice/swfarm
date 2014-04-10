<?php

class WeightTicketRepository implements WeightTicketRepositoryInterface {
    
    public function findAll()
    {
        try
        {
            return WeightTicket::all();
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function findById($id)
    {
        try
        {
            $weightticket = WeightTicket::find($id);

            if(!$weightticket) throw new NotFoundException('Weight Info Not Found');
            return $weightticket;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function store($data)
    {
        $this->validate($data);
        
        try
        {
            $weightticket = $this->instance();
            
            $weightticket->purchaseorder_id = $data['purchaseorder_id'];
            $weightticket->pickupschedule_id = $data['pickupschedule_id'];
            $weightticket->bidproduct_id = $data['bidproduct_id'];
            
            $weightticket->origin_bales = $data['origin_bales'];
            $weightticket->origin_gross = $data['origin_gross'];
            $weightticket->origin_tare = $data['origin_tare'];
            $weightticket->origin_net = $data['origin_net'];
            $weightticket->origin_account_id = $data['origin_account_id'];
            $weightticket->origin_scale_fee = $data['origin_scale_fee'];
            
            $weightticket->destination_bales = $data['destination_bales'];
            $weightticket->destination_gross = $data['destination_gross'];
            $weightticket->destination_tare = $data['destination_tare'];
            $weightticket->destination_net = $data['destination_net'];
            $weightticket->destination_account_id = $data['destination_account_id'];
            $weightticket->destination_scale_fee = $data['destination_scale_fee'];

            $weightticket->save();

            return $weightticket;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function update($id, $data)
    {
        $this->validate($data);
        
        try
        {
            $weightticket = WeightTicket::find($id);
            
            $weightticket->purchaseorder_id = $data['purchaseorder_id'];
            $weightticket->pickupschedule_id = $data['pickupschedule_id'];
            $weightticket->bidproduct_id = $data['bidproduct_id'];
            
            $weightticket->origin_bales = $data['origin_bales'];
            $weightticket->origin_gross = $data['origin_gross'];
            $weightticket->origin_tare = $data['origin_tare'];
            $weightticket->origin_net = $data['origin_net'];
            $weightticket->origin_account_id = $data['origin_account_id'];
            $weightticket->origin_scale_fee = $data['origin_scale_fee'];
            
            $weightticket->destination_bales = $data['destination_bales'];
            $weightticket->destination_gross = $data['destination_gross'];
            $weightticket->destination_tare = $data['destination_tare'];
            $weightticket->destination_net = $data['destination_net'];
            $weightticket->destination_account_id = $data['destination_account_id'];
            $weightticket->destination_scale_fee = $data['destination_scale_fee'];
            
            $weightticket->save();
            
            return $weightticket;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function destroy($id)
    {
        $role = $this->findById($id);
        return $role->delete();
    }
    
    public function validate($data)
    {
        $validator = Validator::make($data, WeightTicket::$rules);
        
        if($validator->fails()) { 
            throw new ValidationException($validator); 
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new WeightTicket($data);
    }

    public function getAllBidProductOnBid($bidId){
        $bidProductOnBid = BidProduct::with('product')
                            ->where('bid_id', '=', $bidId)
                            ->get();
                         
        return $bidProductOnBid->toArray();                
    }

    public function getAllScaleProviderAccount(){
      $accountIds = array(6); //scale provider account type id
      $loader = Account::whereHas('accounttype', function ($query) use ($accountIds){
                    $query->whereIn('id', $accountIds);
                  })->get(array('id', 'name'));
      
      return $loader->toArray();
    }
    
}
