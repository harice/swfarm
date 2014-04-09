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
            $weightticket->product = $data['product'];

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
            $weightticket->product = $data['product'];
            
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
