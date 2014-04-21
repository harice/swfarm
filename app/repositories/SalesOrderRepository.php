<?php

class SalesOrderRepository implements SalesOrderRepositoryInterface {
    
    public function findAll()
    {
        try
        {
            return SalesOrder::with('products')->get();
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
            $salesorder = SalesOrder::with('products')->find($id);

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
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
        $data['products'][0] = array(
            'salesorder_id' => 1,
            'product_id' => 1,
            'description' => 'Sample product order.',
            'stacknumber' => 'S123',
            'tons' => 5.23,
            'bales' => 10,
            'unitprice' => 10.00,
            'created_at' => $date,
            'updated_at' => $date
        );
        
        $this->validate($data['products'][0], 'ProductOrder');
        $this->validate($data, 'SalesOrder');
        
        try
        {
            // Save SalesOrder
            $salesorder = $this->instance();
            $salesorder->fill($data);
            $salesorder->save();
            
            // Save ProductOrder
            $productorder = new ProductOrder();
            $productorder->fill($data['products'][0]);
            $productorder->save();

            return $salesorder;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function update($id, $data)
    {
        $this->validate($data, 'SalesOrder');
        
        try
        {
            $salesorder = $this->findById($id);
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
    
    public function validate($data, $entity)
    {
        $validator = Validator::make($data, $entity::$rules);
        
        if($validator->fails()) { 
            throw new ValidationException($validator); 
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new SalesOrder($data);
    }
    
    public function getOrigin()
    {
        return DB::table('origin')->get();
    }
    
    public function getNatureOfSale()
    {
        return DB::table('nature_of_sale')->get();
    }
    
}
