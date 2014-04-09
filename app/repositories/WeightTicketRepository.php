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
            $weightticket->bales = $data['bales'];
            $weightticket->gross = $data['gross'];
            $weightticket->tare = $data['tare'];
            $weightticket->net = $data['net'];
            $weightticket->po_id = $data['po_id'];
            $weightticket->product = $data['product'];
            $weightticket->scale = $data['scale'];
            $weightticket->scale_fee = $data['scale_fee'];

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
            
            $weightticket->bales = $data['bales'];
            $weightticket->gross = $data['gross'];
            $weightticket->tare = $data['tare'];
            $weightticket->net = $data['net'];
            $weightticket->po_id = $data['po_id'];
            $weightticket->product = $data['product'];
            $weightticket->scale = $data['scale'];
            $weightticket->scale_fee = $data['scale_fee'];
            
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
        $deleted_role = $role;
        
        $role->delete();
        
        return $deleted_role;
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
    
}
