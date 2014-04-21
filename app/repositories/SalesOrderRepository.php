<?php

class SalesOrderRepository implements SalesOrderRepositoryInterface {
    
    public function findAll()
    {
        try
        {
            return SalesOrder::all();
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
            $salesorder = SalesOrder::find($id);

            if(!$salesorder) throw new NotFoundException('Sales Order Not Found');
            return $salesorder;
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
            $salesorder = $this->instance();
            $salesorder->fill($data);
            $salesorder->save();

            return $salesorder;
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
            $salesorder = SalesOrder::find($id);
            $salesorder->fill($data);
            $salesorder->update();
            
            return $salesorder;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function destroy($id)
    {
        $salesorder = $this->findById($id);
        return $salesorder->delete();
    }
    
    public function validate($data)
    {
        $validator = Validator::make($data, SalesOrder::$rules);
        
        if($validator->fails()) { 
            throw new ValidationException($validator); 
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new SalesOrder($data);
    }
    
}
