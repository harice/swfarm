<?php

class OrderRepository implements OrderRepositoryInterface {
    
    public function getAllOrders($params, $orderType = 1) //1 for PO, 2 for SO
    {
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $sortby   = isset($params['sortby']) ? $params['sortby'] : 'created_at';
        $orderby  = isset($params['orderby']) ? $params['orderby'] : 'desc';
        $status = isset($params['status']) ? $params['status'] : null;
        $natureofsale = isset($params['natureofsale']) ? $params['natureofsale'] : null;
        $location = isset($params['location']) ? $params['location'] : null;
        $date = isset($params['date']) ? $params['date'] : null; //default date is the present date
        $transportstart = isset($params['transportstart']) ? $params['transportstart'] : null;
        $transportend = isset($params['transportend']) ? $params['transportend'] : null;
        $filter = isset($params['search']) ? $params['search'] : null;
        
        $order = Order::with('productorder')
                        ->with('productorder.product')
                        ->with('account')
                        ->with('orderaddress', 'orderaddress.addressStates')
                        ->with('location')
                        ->with('status');

        if($orderType == 2) //for SO only
            $order = $order->with('natureofsale');

        $order = $order->where('ordertype', '=', $orderType)
                       ->orderBy($sortby, $orderby);

        //filters
        if ($filter != null){
            $order = $order->where(function($query) use ($filter){
                         $query->orWhereHas('account', function($query) use ($filter){
                              $query->where('name', 'like', '%'.$filter.'%');

                          })
                          ->orWhere(function ($query) use ($filter){
                              $query->orWhere('order_number','like','%'.$filter.'%');
                          });
                      })
                      ->whereNull('deleted_at');
        }

        if ($status){
            $order->where('status_id', '=', $status);
        }

        if ($natureofsale){
            $order->where('natureofsale_id', '=', $natureofsale);
        }

        if ($location){
            $order->where('location_id', '=', $location);
        }

        if($date != null){
          $order = $order->where('created_at', 'like', $date.'%'); 
        }

        //with transport date filter
        if($transportstart != null && $transportend != null){
          $order = $order->where('transportdatestart','like', $transportstart.'%')
                         ->where('transportdateend','like', $transportend.'%');
        }
            
        $result = $order->paginate($perPage);

        //get the total price of products (unit price x tons)
        foreach($result as $item){
          $item['totalPrice'] = 0.00;
          foreach($item['productorder'] as $productorder){
            if($productorder['unitprice'] != null){
              $item['totalPrice'] += $productorder['unitprice'] * $productorder['tons'];
            }
          }
        }

        return $result;
        
    }
    
    public function getOrder($id, $orderType = 1)
    {
        $order = Order::with('productorder')
                ->with('productorder.product')
                ->with('account')
                ->with('orderaddress', 'orderaddress.addressStates')
                ->with('location')
                ->with('status');

        if($orderType == 2) //for SO only
            $order = $order->with('natureofsale');

        $order = $order->where('ordertype', '=', $orderType)->find($id);

        if($order){
          $response = $order->toArray();
        } else {
          $response = array(
            'error' => true,
            'message' => "Order not found");
        }

        return $response;
    }
    
    public function addOrder($data, $orderType = 1)
    {
        
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
        $data['ordertype'] = $orderType;
        $data['order_number'] = $this->generateOrderNumber($orderType);
        $data['user_id'] = Auth::user()->id;
        $data['isfrombid'] = isset($data['isfrombid']) ? $data['isfrombid'] : 0;

        if($data['isfrombid'])
            $data['status_id'] = 4; //Pending status
        else
            $data['status_id'] = 1; //Open status

        $data['businessaddress'] = $this->getBusinessAddress($data['account_id']);
        
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
        
        if($result){
            if($data['ordertype'] == 1)
                return array("error" => "false", "message" => "Purchase order successfully created");
            else
                return array("error" => "false", "message" => "Sales order successfully created");
        }
       
    }
    
    public function updateOrder($id, $data, $orderType = 1)
    {
        $data['ordertype'] = $orderType;
   
        //for purchase order
        $data['createPO'] = isset($data['createPO']) ? $data['createPO'] : 0;
        if($data['createPO']) //update PO status when true
            $data['status_id'] = 1; //Open status

        $data['businessaddress'] = $this->getBusinessAddress($data['account_id']);
        
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
        
        if($result){
            if($data['ordertype'] == 1)
                return array("error" => "false", "message" => "Purchase order successfully updated");
            else
                return array("error" => "false", "message" => "Sales order successfully updated");
        }
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
    
    public function deleteOrder($id)
    {   $result = false;
        $order = Order::find($id);
        if($order)
            $result = $order->delete();
        if($result)
            return array("error" => false, "message" => "Successfully deleted");
        else {
            return array("error" => true, "message" => "Order not found.");
        }
    }
    
    public function validate($data, $entity, $orderType = null)
    {
        if($orderType == null){
            $validator = Validator::make($data, $entity::$rules);
        } else {
            if($orderType == 1){ //PO rules need to used
                $validator = Validator::make($data, $entity::$po_rules);
            } else { //SO rules need to used
                $validator = Validator::make($data, $entity::$so_rules);
            }
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

    public function getNatureOfSale()
    {
        return NatureOfSale::all()->toArray(); //return statuses for orders
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


    public function cancelOrder($id){
        $order = Order::find($id);
        if($order->status_id == 1 || $order->status_id == 4){ //check if Open or pending
          $order->status_id = 3;
          $order->save();

          return array(
              'error' => false,
              'message' => 'Order cancelled.');
        } else if($order->status_id == 3) {
          return array(
              'error' => false,
              'message' => 'Order is already cancelled');
        } else {
          return array(
              'error' => false,
              'message' => 'Order cannot be cancel if the status is not open or pending.');
        }       
    }

    public function getPOStatus(){
        return Status::whereIn('id',array(1,2,3,4))->get()->toArray(); //return statuses for orders
    }

    public function getSOStatus(){
        return Status::whereIn('id',array(1,2,3))->get()->toArray(); //return statuses for orders
    }

    public function getOrderDestination(){
        return Location::whereIn('id',array(1,2,3))->get()->toArray(); //return destination for orders
    }

    public function getOrderPickupLocation(){
        return Location::whereIn('id',array(1,2,3))->get()->toArray(); //return destination for orders
    }

    public function getNatureOfSaleList(){
        return NatureOfSale::all()->toArray(); //return nature of sale for orders
    }
    
}
