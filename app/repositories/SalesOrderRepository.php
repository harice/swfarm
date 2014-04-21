<?php

class SalesOrderRepository implements SalesOrderRepositoryInterface {
    
    public function findAll()
    {
        try
        {
            return SalesOrder::with('products.product')->get();
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
            $salesorder = SalesOrder::with('products.product')->find($id);

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
        
        $data['so_number'] = $this->generateSONumber();
        $data['date_of_sale'] = $date;
        $data['status'] = 'Open';
        $data['user_id'] = 1;
        
        $this->validate($data, 'SalesOrder');
        
        try
        {
            $result = DB::transaction(function() use ($data)
            {
                $salesorder = $this->instance();
                $salesorder->fill($data);
                $salesorder->save();

//                $now = new DateTime('NOW');
//                $date = $now->format('Y-m-d H:i:s');
//
//                $data['products'] = array(
//                    array(
//                        'product_id' => 1,
//                        'description' => 'Sample product order.',
//                        'stacknumber' => 'S123',
//                        'tons' => 5.23,
//                        'bales' => 10,
//                        'unitprice' => 10.00,
//                        'created_at' => $date,
//                        'updated_at' => $date
//                    ),
//                    array(
//                        'product_id' => 1,
//                        'description' => 'Sample product order.',
//                        'stacknumber' => 'S123',
//                        'tons' => 5.23,
//                        'bales' => 10,
//                        'unitprice' => 10.00,
//                        'created_at' => $date,
//                        'updated_at' => $date
//                    ),
//                );

                $this->addProductOrder('salesorder', $salesorder->id, $data['products']);
                
                return $salesorder;
            });
            
            return $result;
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
            $result = DB::transaction(function() use ($id, $data)
            {
                $salesorder = $this->findById($id);
                $salesorder->fill($data);
                $salesorder->update();

                return $salesorder;
            });
            
            return $result;
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
        $data = DB::table('origin')->get();
        return Response::json($data);
    }
    
    public function getNatureOfSale()
    {
        $data = DB::table('nature_of_sale')->get();
        return Response::json($data);
    }
    
    private function generateSONumber(){
        $dateToday = date('Y-m-d');
        $count = SalesOrder::where('created_at', 'like', $dateToday.'%')->count()+1;

        return 'S'.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }
    
    public function addProductOrder($entity, $entity_id, $products = array())
    {
        try
        {
            foreach ($products as $product) {
                $product['entity'] = $entity;
                $product['entity_id'] = $entity_id;
                $product['salesorder_id'] = $entity_id;

                $this->validate($product, 'ProductOrder');

                $productorder = new ProductOrder();
                $productorder->fill($product);

                $productorder->save();
            }
            
            return true;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
}
