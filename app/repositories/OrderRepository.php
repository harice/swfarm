<?php

class OrderRepository implements OrderRepositoryInterface {
    
    public function findAll($params)
    {
        // try
        // {
        //     $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        //     $sortby   = isset($params['sortby']) ? $params['sortby'] : 'so_number';
        //     $orderby  = isset($params['orderby']) ? $params['orderby'] : 'dsc';
        //     $status = isset($params['status']) ? $params['status'] : null;
        //     $nature_of_sale = isset($params['nature_of_sale']) ? $params['nature_of_sale'] : null;
            
        //     if (!isset($params['filter']) || $params['filter'] == '')
        //     {
        //         $salesorders = SalesOrder::with('products.product')
        //             ->with('customer')
        //             ->with('address', 'address.addressStates', 'address.addressCity', 'address.addressType')
        //             ->with('origin')
        //             ->with('natureOfSale')
        //             ->orderBy($sortby, $orderby);
                
        //         if ($status)
        //         {
        //             $salesorders->where('status', 'like', $status);
        //         }
                
        //         $result = $salesorders->paginate($perPage);
        //     }
        //     else
        //     {
        //         $filter = $params['filter'];
                
        //         $result = SalesOrder::with('products.product')
        //             ->with('customer')
        //             ->with('address', 'address.addressStates', 'address.addressCity', 'address.addressType')
        //             ->with('origin')
        //             ->with('natureOfSale')
        //             ->where(function ($query) use ($filter){
        //                 $query->where('status', '=', $filter);
        //             })
        //             ->orderBy($sortby, $orderby)
        //             ->paginate($perPage);
        //     }
                
            
        //     return $result;
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
        //     $salesorder = SalesOrder::with('products.product')
        //         ->with('customer')
        //         ->with('address', 'address.addressStates', 'address.addressCity', 'address.addressType')
        //         ->with('origin')
        //         ->with('natureOfSale')
        //         ->find($id);

        //     if(!$salesorder) throw new NotFoundException('Sales Order Not Found');
            
        //     return $salesorder;
        // }
        // catch (Exception $e)
        // {
        //     return $e->getMessage();
        // }
    }
    
    public function store($data)
    {
        
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
        $data['ordertype'] = 1; //PO type
        $data['order_number'] = $this->generateOrderNumber(1);
        $data['dateofsale'] = $date;
        $data['status_id'] = 1; //Open status
        $data['user_id'] = Auth::user()->id;

        $data['businessaddress'] = $this->getBusinessAddress($data['account_id']);
        // $data['address_id'] = $customer_address['id'];
        
        $this->validate($data, 'Order', $data['ordertype']);
       
        $result = DB::transaction(function() use ($data)
        {
            $data['orderaddress_id'] = $this->addOrderAddress($data['businessaddress']);

            $order = $this->instance();
            $order->fill($data);
            $order->save();

            $this->addProductOrder($order->id, $data['products']);
            
            return $order;
        });
        
        return $result;
       
    }

    public function addOrderAddress($data, $orderAddressId = null){
        $this->validate($data, 'OrderAddress');

        if($orderAddressId == null)
            $orderaddress = new OrderAddress;
        else
            $orderaddress = OrderAddress::find($orderAddressId);
        $orderaddress->fill($data);
        $orderaddress->save();

        return $orderaddress->id;
    }
    
    public function update($id, $data)
    {
        // $now = new DateTime('NOW');
        // $date = $now->format('Y-m-d H:i:s');
        
        $data['ordertype'] = 1; //PO type
        // $data['order_number'] = $this->generateOrderNumber(1);
        // $data['dateofsale'] = $date;
        // $data['status_id'] = 1; //Open status
        // $data['user_id'] = Auth::user()->id;

        $data['businessaddress'] = $this->getBusinessAddress($data['account_id']);
        // $data['address_id'] = $customer_address['id'];
        
        $this->validate($data, 'Order', $data['ordertype']);
       
        $result = DB::transaction(function() use ($id, $data)
        {   
            $order = Order::find($id);


            $this->addOrderAddress($data['businessaddress'], $order->orderaddress_id); //just editing the address

            $order->fill($data);
            $order->save();
            if(isset($data['products'])){
                $this->deleteProductOrder($id, $data['products']); //delete product order that is remove by client
                $this->addProductOrder($order->id, $data['products']);
            } else {
                $this->deleteProductOrder($id, null);
            }
            return $order;
        });
        
        return $result;
    }

    private function deleteProductOrder($orderId, $products){
      //deleting bidproduct
      $existingProductOrderId = array();
      if($products != null){
          foreach($products as $item){
            $productOrderData = $item;
            if(isset($productOrderData['id'])){
              $existingProductOrderId[] = $productOrderData['id'];
            }
          }
        }
    if($existingProductOrderId == null){ //delete all product order associated with this order
      $productOrder = ProductOrder::with('order')
                ->whereHas('order', function($query) use ($orderId)
                {
                    $query->where('id', '=', $orderId);

                })
                ->delete();
    } else { //delete product order that is included in array
      $productOrder = ProductOrder::with('order')
                ->whereHas('order', function($query) use ($orderId)
                {
                    $query->where('id', '=', $orderId);

                })
                ->whereNotIn('id',$existingProductOrderId)
                ->delete();
    }
    return $productOrder;
  }
    
    public function destroy($id)
    {
        // $salesorder = $this->findById($id);
        // return $salesorder->delete();
    }
    
    public function validate($data, $entity, $orderType = null)
    {
        if($orderType == null)
            $validator = Validator::make($data, $entity::$rules);
        else{
            if($orderType == 1) //PO rules need to used
                $validator = Validator::make($data, $entity::$po_rules);
            else //SO rules need to used
                $validator = Validator::make($data, $entity::$so_rules);
        }
        
        if($validator->fails()) { 
            throw new ValidationException($validator); 
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new Order($data);
    }
    
    public function getOrigin()
    {
        // $data = DB::table('origin')->get();
        // return Response::json($data);
    }
    
    public function getNatureOfSale()
    {
        // $data = DB::table('nature_of_sale')->get();
        // return Response::json($data);
    }
    
    private function generateOrderNumber($type = 1){ //type default is PO
        $prefix = 'P';
        if($type == 2)
            $prefix = 'S';

        $dateToday = date('Y-m-d');
        $count = Order::where('created_at', 'like', $dateToday.'%')
                      ->where('ordertype', '=', $type)->count()+1;
        
        return $prefix.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }
    
    private function addProductOrder($order_id, $products = array())
    {
        
            foreach ($products as $product) {
                $product['order_id'] = $order_id;

                $this->validate($product, 'ProductOrder');
                if(isset($product['id']))
                    $productorder = ProductOrder::find($product['id']);
                else
                    $productorder = new ProductOrder();

                $productorder->fill($product);
                $productorder->save();
            }
        
        
    }
    
    private function updateProductOrder($productorders)
    {
        // try
        // {
        //     foreach ($productorders as $productorder)
        //     {
        //         $productorder_data = $productorder;
                
        //         // $productorder_data['description'] = 'Test descsdf';

        //         $productorder = ProductOrder::find($productorder_data->id);
        //         $productorder->fill($productorder_data->toArray());
                
        //         $productorder->update();
        //     }
        // }
        // catch (Exception $e)
        // {
        //     return $e->getMessage();
        // }
            
    }
    
    private function getBusinessAddress($account_id)
    {
        $result = Address::where('type', '=', 1)
            ->where('account', '=', $account_id)
            ->first(array('street', 'city', 'state', 'zipcode'))->toArray();
        return $result;
    }
    
    public function close($id)
    {
    //     $salesorder = SalesOrder::find($id);
    //     $salesorder->status = "Close";
    //     $salesorder->save();
    }
    
    public function cancel($id)
    {
        // $salesorder = SalesOrder::find($id);
        // $salesorder->status = "Cancelled";
        // $salesorder->save();
    }
    
}
