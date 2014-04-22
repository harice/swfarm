<?php

class SalesOrderRepository implements SalesOrderRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $sortby   = isset($params['sortby']) ? $params['sortby'] : 'so_number';
            $orderby  = isset($params['orderby']) ? $params['orderby'] : 'dsc';
            $status = isset($params['status']) ? $params['status'] : null;
            $nature_of_sale = isset($params['nature_of_sale']) ? $params['nature_of_sale'] : null;
            
            if (!isset($params['filter']) || $params['filter'] == '')
            {
                $salesorders = SalesOrder::with('products.product')
                    ->with('customer')
                    ->with('address', 'address.addressStates', 'address.addressCity', 'address.addressType')
                    ->with('origin')
                    ->with('natureOfSale')
                    ->orderBy($sortby, $orderby);
                
                if ($status)
                {
                    $salesorders->where('status', 'like', $status);
                }
                
                $result = $salesorders->paginate($perPage);
            }
            else
            {
                $filter = $params['filter'];
                
                $result = SalesOrder::with('products.product')
                    ->with('customer')
                    ->with('address', 'address.addressStates', 'address.addressCity', 'address.addressType')
                    ->with('origin')
                    ->with('natureOfSale')
                    ->where(function ($query) use ($filter){
                        $query->where('status', '=', $filter);
                    })
                    ->orderBy($sortby, $orderby)
                    ->paginate($perPage);
            }
                
            
            return $result;
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
            $salesorder = SalesOrder::with('products.product')
                ->with('customer')
                ->with('address', 'address.addressStates', 'address.addressCity', 'address.addressType')
                ->with('origin')
                ->with('natureOfSale')
                ->find($id);

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
        
        $customer_address = $this->getAddress($data['customer_id']);
        $data['address_id'] = $customer_address[0]['id'];
        
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
                
                $this->updateProductOrder($salesorder['products']);
                
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
    
    private function addProductOrder($entity, $entity_id, $products = array())
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
    
    private function updateProductOrder($productorders)
    {
        try
        {
            foreach ($productorders as $productorder)
            {
                $productorder_data = $productorder;
                
                // $productorder_data['description'] = 'Test descsdf';

                $productorder = ProductOrder::find($productorder_data->id);
                $productorder->fill($productorder_data->toArray());
                
                $productorder->update();
            }
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
            
    }
    
    private function getAddress($account_id)
    {
        $result = Address::where('type', '=', 1)
            ->where('account', '=', $account_id)
            ->get();
        return $result;
    }
    
    public function close($id)
    {
        $salesorder = SalesOrder::find($id);
        $salesorder->status = "Close";
        $salesorder->save();
    }
    
    public function cancel($id)
    {
        $salesorder = SalesOrder::find($id);
        $salesorder->status = "Cancelled";
        $salesorder->save();
    }
    
}
