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
        

        $order = Order::with('productsummary.productname')
                ->with('productsummary.productorder.product')
                ->with('productsummary.productorder.document')
                ->with('account')
                ->with('contact')
                ->with('orderaddress', 'orderaddress.addressStates')
                ->with('location')
                ->with('status')
                ->with('ordercancellingreason.reason');

        if($orderType == 2) //for SO only
            $order = $order->with('natureofsale', 'contract');

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
          $item['weightPercentageDelivered'] = $this->getExpectedDeliveredData($item['id']);
          foreach($item['productsummary'] as $productsummary){
            foreach($productsummary['productorder'] as $productorder){
                if($productorder['unitprice'] != null){
                  $item['totalPrice'] += $productorder['unitprice'] * $productorder['tons'];
                }
            }
        }
        }

        return $result;
        
    }

    public function getExpectedDeliveredData($orderId){
        $order = Order::with('productorder.product')
                        ->with('productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_pickup')
                        ->with('productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_dropoff')
                        ->with('productorder.transportscheduleproduct.weightticketproducts.weightticketscale_type')
                        ->find($orderId);  
        // return $order->toArray();
        if($order == null){
            return array(
                'error' => true,
                'message' => "Order not found");
        }
        
        $stackList = array();
        $index = 0;
        $result = array();
        $result['expected'] = 0;
        $result['delivered'] = 0;
        $result['returned'] = 0;
        foreach($order['productorder'] as $productOrder){
 
            $totalDeliveries = 0;
            $deliveredWeight = 0;
            
            foreach($productOrder['transportscheduleproduct'] as $transportscheduleproduct){
                $weightTypeToBeUsed = 1; //pickup weight ticket default
                if(!isset($transportscheduleproduct['transportschedule']['weightticket'])){
                    continue;
                }
                
                $weightTicket = $transportscheduleproduct['transportschedule']['weightticket'];

                if($weightTicket['pickup_id'] != null && $weightTicket['dropoff_id'] != null){ //with both pickup and dropoff weight ticket
                    $weightTicketPickup = $weightTicket['weightticketscale_pickup'];
                    $weightTicketDropoff = $weightTicket['weightticketscale_dropoff'];
                    //compute net weight
                    if($weightTicketPickup['gross'] != null && $weightTicketPickup['tare'] != null){
                        $pickupNetWeight = number_format($weightTicketPickup['gross'] - $weightTicketPickup['tare'], 3);
                        $dropoffNetWeight = number_format($weightTicketDropoff['gross'] - $weightTicketDropoff['tare'], 3);
                    } else {
                        $pickupNetWeight = 0;
                        $dropoffNetWeight = 0;
                    }

                    //check if weightticket has more than one product
                    if(count($weightTicketPickup['weightticketproducts']) > 1 || count($weightTicketDropoff['weightticketproducts']) > 1){ //if weight ticket product is more than 1
                        
                        if($pickupNetWeight <= $dropoffNetWeight){
                            $weightTypeToBeUsed = 1; //use pickup weight ticket
                        } else {
                            $weightTypeToBeUsed = 2; //use dropoff weight ticket
                        }

                        $deliveredWeight = $this->getWeightTicketProductTobeUsed($weightTypeToBeUsed, $transportscheduleproduct['weightticketproducts']);
                        
                    } else {
                        if($pickupNetWeight <= $dropoffNetWeight){
                            $deliveredWeight = $pickupNetWeight;
                        } else {
                            $deliveredWeight = $dropoffNetWeight;
                        }
                    }
                } else if($weightTicket['pickup_id'] != null){ //pickup weighticket only
                    $weightTicketPickup = $weightTicket['weightticketscale_pickup'];
                   
                    if(count($weightTicketPickup['weightticketproducts']) > 1){
                        $deliveredWeight = $this->getWeightTicketProductTobeUsed(1, $transportscheduleproduct['weightticketproducts']);
                    } else {
                        if($weightTicketPickup['gross'] != null && $weightTicketPickup['tare'] != null){
                            $deliveredWeight = number_format($weightTicketPickup['gross'] - $weightTicketPickup['tare'], 3);
                        } else {
                            $deliveredWeight = number_format(0, 3);
                        }
                    }
                } else { //dropoff weight ticket only
                    $weightTicketDropoff = $weightTicket['weightticketscale_dropoff'];
    
                    if(count($weightTicketDropoff['weightticketproducts']) > 1){ //if product on weight ticket is more than 1
                        $deliveredWeight = $this->getWeightTicketProductTobeUsed(2, $transportscheduleproduct['weightticketproducts']);
                    } else {
                        if($weightTicketDropoff['gross'] != null && $weightTicketDropoff['tare'] != null){
                            $deliveredWeight = number_format($weightTicketDropoff['gross'] - $weightTicketDropoff['tare'], 3);
                        } else {
                            $deliveredWeight = number_format(0, 3);
                        }
                    }
                }

                $totalDeliveries += $deliveredWeight;

            }
            
            
            $result['delivered'] += $totalDeliveries;
            $result['expected'] += $productOrder['tons'];
            
            if($order['ordertype'] == Config::get('constants.ORDERTYPE_SO')){ //only SO can have return products
                //get total weight return on product order
                $result['returned'] += $this->getTotalStackReturnedOnOrderUsingStackNumber($order['id'], $productOrder['stacknumber']);
            }
            
        }
        $result['delivered'] = $result['delivered'] / 0.0005; // convert pounds to tons
        $result['delivered'] = $result['delivered']-$result['returned']; //deduct all the returned product        

        if($result['delivered'] != null && $result['delivered'] != 0){
            $result['percentage'] = intval(($result['delivered']/$result['expected']) * 100);    
        } else {
            $result['percentage'] = 0;
        }

        if($result['percentage'] > 100){
            $result['percentage'] = 100;
        }
        return $result['percentage'];
    }

    public function getOrder($id, $orderType = 1)
    {
        $order = Order::with('productsummary.productname')
                ->with('productsummary.productorder.product')
                ->with('productsummary.productorder.document')
                ->with('productsummary.productorder.sectionfrom.storagelocation')
                ->with('account')
                ->with('contact')
                ->with('orderaddress', 'orderaddress.addressStates')
                ->with('location')
                ->with('status')
                ->with('ordercancellingreason.reason')
				->with('contract.account');

        if($orderType == 2) //for SO only
            $order = $order->with('natureofsale', 'contract');

        $order = $order->where('ordertype', '=', $orderType)->find($id);

        if($order){
            $response = array();
            $response = $order->toArray();
            //if dropship
            if($response['location_id'] == Config::get('constants.LOCATION_DROPSHIP')){
                $response['salesorder_id'] = $this->getSalesOrderId($id);
            }
        } else {
          $response = array(
            'error' => true,
            'message' => "Order not found");
        }

        return $response;
    }

    private function getSalesOrderId($id){
        $result = Order::where('purchaseorder_id', '=', $id)->first(array('id'));
        // var_dump($result);
        if($result)
            return $result->id;
        else 
            return null;
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
        
        if ($orderType == 1) {
            if(isset($data['location_id'])){
                if ($data['location_id'] != 3) {
                    unset($data['contract_id']);
                }
            }
        } else {
            if (isset($data['natureofsale_id'])) {
                if ($data['natureofsale_id'] != Config::get('constants.NOS_RESERVED')) {
                    unset($data['contract_id']);
                }
            }
        }

        $this->validate($data, 'Order', $data['ordertype']);

        $data['businessaddress'] = $this->getBusinessAddress($data['account_id']);
        
        if(!isset($data['contract_id']) || $data['contract_id'] == '')
            $data['contract_id'] = null;

        $result = array();
        DB::beginTransaction();
        // $result = DB::transaction(function() use ($data)
        // {
            
            $data['orderaddress_id'] = $this->addOrderAddress($data['businessaddress']);

            $order = $this->instance();
            $order->fill($data);
            $order->save();

            if(isset($data['object_id'])){
                $isMobile = true;
            } else {
                $isMobile = false;
            }

            $productResult = $this->addProductToOrder($order->id, $data['products'], $isMobile);
            if(isset($productResult['stacknumberError'])){ //duplicate stack number with different product
                $result = array(
                    "error" => true,
                    'message' => "Stack number ".$productResult['stacknumber']." already taken by different product.");
            } else if(isset($productResult['stacknumberRepeatedError'])){
                $result = array(
                    "error" => true,
                    'message' => "Stack number ".$productResult['stacknumber']." has been use repeatedly in this order."
                );
            } else if(isset($productResult['productTypeRepeatedError'])){
                $result = array(
                    "error" => true,
                    'message' => "Cannot use the same product type in an order."
                );
            } else if($productResult['hasHoldProduct'] && $data['ordertype'] == 1){ //for purchase order only
                $order->status_id = 7; //Testing status
                $order->save();
            }

            if(isset($data['location_id']) && isset($data['checkinorder'])){
                if($order->status_id == 7){ //has testing products on order
                    $result = array(
                        "error" => true,
                        'message' => "Cannot do check in to inventory when order contains hold product(s)."
                    );
                }
                //if dropship and client click the button to create SO
                if($data['location_id'] == Config::get('constants.LOCATION_DROPSHIP') && $data['checkinorder'] == true){
                    $dropshipResult = $this->checkInPurchaseOrderProducts($order->id, true);  
                    $result = array('dropship' => true, 'data' => $dropshipResult);  
                } else if($data['location_id'] == Config::get('constants.LOCATION_PRODUCER') && $data['checkinorder'] == true){
                    $producerResult = $this->checkInPurchaseOrderProducts($order->id, false);  
                    $result = array('producer' => true, 'data' => $producerResult);
                }
            }
            
            // return $order;
        // });
        
        // if(count($result) > 0){
        if(isset($result['error'])){
            if($result['error']){
                DB::rollback();
                return array(
                    "error" => true,
                    'message' => $result['message']
                );
            }
        } else if(isset($result['dropship']) || isset($result['producer'])){
            if($result['data']['error'] == false){ //no error
                DB::commit();    
            }
            return $result['data'];
        }

        if($isMobile){ //request came from mobile app
            DB::commit();
            return array(
                "error" => false,
                "message" => Lang::get('messages.success.created', array('entity' => 'Order')),
                "data" => array(
                            'id' => $order->id, 
                            'ordernumber' => $order->order_number,
                            'object_id' => $data['object_id'], 
                            'products' => $productResult['mobileJson']
                            )
            );
        } else {
           if($data['ordertype'] == 1){
                DB::commit();
                return array(
                    "error" => false,
                    "message" => Lang::get('messages.success.created', array('entity' => 'Purchase Order')
                    )
                );
            }
            else {
                DB::commit();
                return array(
                    "error" => false,
                    'message' => Lang::get('messages.success.created', array('entity' => 'Sales Order'))
                );
            } 
        }
       
    }
    
    public function updateOrder($id, $data, $orderType = 1)
    {
        $data['ordertype'] = $orderType;
   
        //for purchase order
        $data['createPO'] = isset($data['createPO']) ? $data['createPO'] : 0;
        if($data['createPO']) //update PO status when true
            $data['status_id'] = 1; //Open status
        
        if ($orderType == 1) {
            if(isset($data['location_id'])){
                if ($data['location_id'] != 3) {
                    unset($data['contract_id']);
                }
            }
            
        } else {
            if (isset($data['natureofsale_id'])) {
                if ($data['natureofsale_id'] != Config::get('constants.NOS_RESERVED')) {
                    unset($data['contract_id']);
                }
            }
        }

        $this->validate($data, 'Order', $data['ordertype']);

        $data['businessaddress'] = $this->getBusinessAddress($data['account_id']);
        
        if(!isset($data['contract_id']) || $data['contract_id'] == '')
            $data['contract_id'] = null;

        $result = array();
        DB::beginTransaction();
        // $result = DB::transaction(function() use ($id, $data)
        // {   
            $productResult = null;
            $order = Order::find($id);

            $this->addOrderAddress($data['businessaddress'], $order->orderaddress_id); //just editing the address

            $order->fill($data);
            $order->save();

            if(isset($data['object_id'])){
                $isMobile = true;
            } else {
                $isMobile = false;
            }

            if(isset($data['products'])){
                $this->deleteProductOrderSummary($id, $data['products']); //delete product order that is remove by client
                $productResult = $this->addProductToOrder($order->id, $data['products'], $isMobile, true);
            } else {
                $this->deleteProductOrderSummary($id, null);
            }

            if(isset($productResult['stacknumberError'])){ //duplicate stack number with different product
                $result = array(
                    "error" => true,
                    'message' => "Stack number ".$productResult['stacknumber']." already taken by different product."
                );
            } else if(isset($productResult['stacknumberRepeatedError'])){
                $result = array(
                    "error" => true,
                    'message' => "Stack number ".$productResult['stacknumber']." has been use repeatedly."
                );
            } else if(isset($productResult['productTypeRepeatedError'])){
                $result = array(
                    "error" => true,
                    'message' => "Cannot use the same product type in an order."
                );
            } else if($productResult != null && $data['ordertype'] == 1 && $order->status_id != 4){ //for purchase order only, status 4 is pending
                if($productResult['hasHoldProduct']){
                    $order->status_id = 7; //Testing status
                } else {
                    $order->status_id = 1; //Open Status
                }
                $order->save();
            }
            //update verified column
            if(isset($data['verified'])){
               if($data['verified'] == 1) {
                    $order->verified = 1;
                    $order->save();
                } 
            }

            if(isset($data['location_id']) && isset($data['checkinorder'])){
                if($order->status_id == 7){ //has testing products on order
                    $result = array(
                        "error" => true,
                        'message' => "Cannot do check in to inventory when order contains hold product(s)."
                    );
                }
                //if dropship and client click the button to create SO
                if($data['location_id'] == Config::get('constants.LOCATION_DROPSHIP') && $data['checkinorder'] == true){
                    $dropshipResult = $this->checkInPurchaseOrderProducts($order->id, true);  
                    $result = array('dropship' => true, 'data' => $dropshipResult);  
                } else if($data['location_id'] == Config::get('constants.LOCATION_PRODUCER') && $data['checkinorder'] == true){
                    $producerResult = $this->checkInPurchaseOrderProducts($order->id, false);  
                    $result = array('producer' => true, 'data' => $producerResult);
                }
            }
            
            // if(isset($data['location_id']) && isset($data['checkinorder'])){
            //     if($order->status_id == 7){ //has testing products on order
            //         $result = array(
            //             "error" => true,
            //             'message' => "Cannot do check in to inventory when order contains hold product(s)."
            //         );
            //     }
            //     //if dropship and client click the button to create SO
            //     if($data['location_id'] == Config::get('constants.LOCATION_DROPSHIP') && $data['checkinorder'] == true){
            //         $dropshipResult = $this->checkInPurchaseOrderProducts($order->id, true);  
            //         $result = array('dropship' => true, 'data' => $dropshipResult);  
            //     } else if($data['location_id'] == Config::get('constants.LOCATION_PRODUCER') && $data['checkinorder'] == true){
            //         $producerResult = $this->checkInPurchaseOrderProducts($order->id, false);  
            //         $result = array('producer' => true, 'data' => $producerResult);
            //     }
            // }
            

        //     return $order;
        // });
        
        // if($result){
        if(isset($result['error'])){
            if($result['error']){
                DB::rollback();
                return array(
                    "error" => true,
                    'message' => $result['message']
                );
            }
        } else if(isset($result['dropship']) || isset($result['producer'])){
            if($result['data']['error'] == false){ //no error
                DB::commit();    
            }
            return $result['data'];
        }

        if($isMobile){ //request came from mobile app
            DB::commit();
            return array(
                "error" => false,
                "message" => Lang::get('messages.success.updated', array('entity' => 'Order')),
                "data" => array(
                            'id' => $order->id, 
                            'object_id' => $data['object_id'], 
                            'products' => $productResult['mobileJson']
                            )
            );
        } else {
            if($data['ordertype'] == 1){
                DB::commit();
                return array(
                    "error" => false,
                    'message' => Lang::get('messages.success.updated', array('entity' => 'Purchase Order'))
                );
            } else {
                DB::commit();
                return array(
                    "error" => false,
                    'message' => Lang::get('messages.success.updated', array('entity' => 'Sales Order'))
                );
            }
        }     
        // }
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

    private function deleteProductOrderSummary($orderId, $products){
        //deleting bidproduct
        $existingProductOrderSummaryId = array();
        if($products != null){
            foreach($products as $item){
              $productOrderData = $item;
              if(isset($productOrderData['id'])){
                    $existingProductOrderSummaryId[] = $productOrderData['id'];
                }
            }
        }
        if($existingProductOrderSummaryId == null){ //delete all product order associated with this order
          $ProductOrderSummary = ProductOrderSummary::with('order')
                    ->whereHas('order', function($query) use ($orderId)
                    {
                        $query->where('id', '=', $orderId);

                    })
                    ->delete();
        } else { //delete product order that is included in array
            $ProductOrderSummary = ProductOrderSummary::with('order')
                    ->whereHas('order', function($query) use ($orderId)
                    {
                        $query->where('id', '=', $orderId);

                    })
                    ->whereNotIn('id',$existingProductOrderSummaryId)
                    ->delete();

            foreach($products as $product){
                if(isset($product['id'])){
                    $deleteProductOrder = $this->deleteProductOrder($orderId, $product);        
                }
            }
           
        }

        return $ProductOrderSummary;
    }

    private function deleteProductOrder($orderId, $product){
        $stacks = $product['stacks'];
        $existingProductOrderId = array();
        if($stacks != null){
            foreach($stacks as $item){
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

                            })->where('productordersummary_id', '=', $product['id'])
                            ->delete();
        } else { //delete product order that is included in array
            $productOrder = ProductOrder::with('order')
                            ->whereHas('order', function($query) use ($orderId)
                            {
                                $query->where('id', '=', $orderId);

                            })
                            ->whereNotIn('id',$existingProductOrderId)
                            ->where('productordersummary_id', '=', $product['id'])
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
        $messages = array(
            'rfv.required_if' => 'The RFV field is required when product is on hold.',
        );
        if($orderType == null){
            $validator = Validator::make($data, $entity::$rules);
        } else {
            if($orderType == 1){ //PO rules need to used
                $validator = Validator::make($data, $entity::$po_rules, $messages);
            } else { //SO rules need to used
                $validator = Validator::make($data, $entity::$so_rules, $messages);
                $validator->sometimes('contract_id', 'required', function($data)
                {
                    return $data->natureofsale_id == Config::get('constants.NOS_RESERVED');
                });
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
    /* old format P20150101-0001
    private function generateOrderNumber($type = 1){ //type default is PO
        $prefix = 'P';
        if($type == 2)
            $prefix = 'S';

        $dateToday = date('Y-m-d');
        $count = Order::where('created_at', 'like', $dateToday.'%')
                      ->where('ordertype', '=', $type)->count()+1;
        
        return $prefix.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }*/
    //new format of order number
    private function generateOrderNumber($type = 1){ //type default is PO
        $prefix = 'P1';
        if($type == 2)
            $prefix = 'S1';

        $count = Order::where('ordertype', '=', $type)->count()+1;
        
        return $prefix.str_pad($count, 6, '0', STR_PAD_LEFT);
    }

    private function addProductToOrder($order_id, $products = array(), $isMobile = false, $isUpdate = false)
    {   
        if($this->checkIfHasRepeatingProductType($products)){
            return array("productTypeRepeatedError" => true);
        }
        $result = array('hasHoldProduct' => false, 'mobileJson' => null);
        $stacknumbersUsed = array();
        
        $mobileJson = array();
        
        foreach ($products as $product){
            if(isset($product['id'])){
                $productordersummary = ProductOrderSummary::find($product['id']);
            }
            else {
                $productordersummary = new ProductOrderSummary();
            }
            $product['order_id'] = $order_id;
            $productordersummary->fill($product);
            $productordersummary->save();

            //check if same stack number is used in saving order
            foreach($product['stacks'] as $item){
                if(!in_array(strtolower($item['stacknumber']), $stacknumbersUsed)){
                    array_push($stacknumbersUsed, strtolower($item['stacknumber'])); 
                } else {
                    return array("stacknumberRepeatedError" => true, "stacknumber"=>$item['stacknumber']);
                }
            }

            $stacks = $this->addStacksToOrder($order_id, $product['stacks'], $productordersummary->id, $isMobile);

            if(isset($stacks['stacknumberError'])){
                if($stacks['stacknumberError']){
                    $result['stacknumberError'] = true;
                    $result['stacknumber'] = $stacks['stacknumber'];
                }
            } else if(isset($stacks['stacknumberRepeatedError'])){
                if($stacks['stacknumberRepeatedError']){
                    $result['stacknumberRepeatedError'] = true;
                    $result['stacknumber'] = $stacks['stacknumber'];
                }
            } else {
                if($isMobile && isset($stacks['mobileJson'])){
                    array_push($mobileJson, array('id' => $productordersummary->id, 'object_id' => $product['object_id'], 'stacks' => $stacks['mobileJson']));
                }
            }
            

            if(isset($stacks['hasHoldProduct'])){
                if($stacks['hasHoldProduct']){
                    $result['hasHoldProduct'] = true;
                }
            }
            
        }

        if($isMobile)
            $result['mobileJson'] = $mobileJson;

        return $result;
    }
    
    private function addStacksToOrder($order_id, $products = array(), $productordersummary_id, $isMobile = false){
        $result = array('hasHoldProduct' => false, 'mobileJson' => null);
        
        $stacknumbersUsed = array();
        $stackTempVar = array();
        foreach ($products as $product) 
        {
            // tocheck
            if($this->checkIfStackNumberIsTakenByOtherProduct($product['stacknumber'], $product['product_id'])){
                return array("stacknumberError" => true, "stacknumber"=>$product['stacknumber']);
            }

            $product['order_id'] = $order_id;
            $product['productordersummary_id'] = $productordersummary_id;
            //set order status to testing when it has product hold with no rfv and file set
            if(isset($product['ishold']) && $result['hasHoldProduct'] == false){
                if($product['ishold'] == 1){
                    if(isset($product['rfv']) && isset($product['uploadedfile'])) {
                        if($product['rfv'] == '' || $product['uploadedfile'] == ''){
                            $result['hasHoldProduct'] = true;
                        }
                    } 
                }
            }
           
            $this->validate($product, 'ProductOrder');

            if(isset($product['id'])){
                $productorder = ProductOrder::find($product['id']);
            } else {
                $productorder = new ProductOrder;
            }

            if($product['section_id'] == ''){
                $product['section_id'] = null;
            }

            $productorder->fill($product);
            $productorder->save();

            if($isMobile)
                array_push($stackTempVar, array('id' => $productorder->id, 'object_id' => $product['object_id']));

            if($product['stacknumber'] != ''){ //insert in stack table
                //get the account id who owns the stacknumber
                $account = Order::find($order_id)->first(array('id'));
                $this->addToStackTable($product['stacknumber'], $product['unitprice'], $product['product_id'], $account['id']);
            }

            if(isset($product['uploadedfile']) && !empty($product['uploadedfile'])){
                $this->linkUploadDocumentToProductOrder($product['uploadedfile'], $productorder->id);
            }

        }

        if($isMobile)
            $result['mobileJson'] = $stackTempVar;

        return $result;
    }

    private function addToStackTable($stacknumber, $unitprice, $productId, $accountId = null){
        $isExist = Stack::where('stacknumber', '=', $stacknumber)->where('product_id', '=', $productId)->count();
        if($isExist == 0){
            $stack = new Stack;
            $stack->stacknumber = $stacknumber;
            $stack->product_id = $productId;
            $stack->account_id = $accountId;
            $stack->unitprice = $unitprice;
            $stack->save();
        }
    }

    private function checkIfHasRepeatingProductType($products){
        $hasRepeatingProductType = false;
        $productTypeIds = array();
        //check if same stack number is used in saving order
        foreach($products as $item){
            if(!in_array(strtolower($item['product_id']), $productTypeIds)){
                array_push($productTypeIds, strtolower($item['product_id'])); 
            } else {
                $hasRepeatingProductType = true;
                break;
            }
        }
        return $hasRepeatingProductType;
    }

    public function checkIfStackNumberIsTakenByOtherProduct($stacknumber, $productId){
        $isExist = Stack::where('stacknumber', '=', $stacknumber)->where('product_id', '!=', $productId)->count();
        if($isExist > 0){
            return true;
        } else {
            return false;
        }
    }

    private function linkUploadDocumentToProductOrder($uploadedfile, $productorderid)
    {
        $prd_o = ProductOrder::find($productorderid);
        if($prd_o)
        {
            if($prd_o->document) 
            {
                if($prd_o->document->id != $uploadedfile) 
                {
                    $prd_o->document->delete();

                    if(!empty($uploadedfile)) {
                        $file = Document::find($uploadedfile);
                        $file->issave = 1;
                        $file->documentable_id = $prd_o->id;
                        $file->documentable_type = get_class($prd_o);
                        $file->save();
                    }
                }
            } else {
                $file = Document::find($uploadedfile);
                $file->issave = 1;
                $file->documentable_id = $prd_o->id;
                $file->documentable_type = get_class($prd_o);
                $file->save();
            }
        }
    }
   
    private function getBusinessAddress($account_id)
    {
        $result = Address::where('type', '=', 1)
            ->where('account', '=', $account_id)
            ->first(array('street', 'city', 'state', 'zipcode'))->toArray();
        return $result;
    }
    
    public function closeOrder($id)
    {
        $order = Order::with('transportschedule')->find($id);

        if($order->status_id == 3 || $order->status_id == 5 || $order->status_id == 6){ //order is cancelled
            return array(
                        'error' => true,
                        'message' => 'Order is already cancelled, cannot change the status to close.');
        } else if($order->transportschedule->toArray() == null){
            return array(
                        'error' => true,
                        'message' => 'Order is has no schedule. Change the status to cancel instead.');
        } else if($order->status_id != 2){
            // $transportSchedules = TransportSchedule::where('order_id', '=', $id)->get()->toArray();
            $transportSchedules = $order->transportschedule->toArray();
            $allScheduleIsClose = true;
            foreach($transportSchedules as $schedule){
                if($schedule['status_id'] != 2){ //if schedule is not in close status
                    $allScheduleIsClose = false;
                    break;
                }
            }

            ## 29-April-2015
            if( $order->ordertype == 1 )
            {
                $entity_msg = "Purchase Order";
            }
            elseif ( $order->ordertype == 2) 
            {
                $entity_msg = "Sales Order";
            }
            else
            {
                $entity_msg = "Order";
            }
            ## end 29-April-2015

            if($allScheduleIsClose){
               
                $order->status_id = 2;
                $order->save();
                // echo "CLOSING";

                return array(
                        'error' => false,
                        'message' => $entity_msg.' successfully closed.');
            } else {
                return array(
                        'error' => true,
                        'message' => $entity_msg.' has open schedule(s).');
            }
        } else {
            return array(
                        'error' => true,
                        'message' => $entity_msg.' status is already closed.');
        }
    }

    private function insertReasonForCancellingOrder($data){
        $this->validate($data, 'OrderCancellingReason');
        $ordercancellingreason =  new OrderCancellingReason;
        $ordercancellingreason->order = $data['order'];
        $ordercancellingreason->reason = $data['reason'];
        if($data['others'] != null && $data['others'] != ''){
           $ordercancellingreason->others = $data['others']; 
        }
        $ordercancellingreason->save();
    }


    public function cancelOrder($id, $data){
        $order = Order::find($id);
        if($this->checkIfHasWeightTicket($id)){
            return array(
                  'error' => true,
                  'message' => 'Order with weight ticket cannot be cancelled.');
        }

        $data['order'] = $id;

        if($order->isfrombid == 1 && $order->status_id == 4 && $order->ordertype == 1){ //PO that is on bid
            $order->status_id = 5; //Bid Cancelled Status
            $order->save();

            $this->insertReasonForCancellingOrder($data);

            return array(
                  'error' => false,
                  'message' => 'Bid cancelled.');
        } else if($order->ordertype == 1 && $order->status_id != 6 && $order->status_id != 5){ //PO that is not bid
            $order->status_id = 6; //PO Cancelled Status
            $order->save();

            $this->insertReasonForCancellingOrder($data);

            return array(
                  'error' => false,
                  'message' => 'Purchase Order cancelled.');
        } else if($order->status_id == 1 || $order->status_id == 4){ //check if Open or pending, for sales order
              $order->status_id = 3;
              $order->save();

              $this->insertReasonForCancellingOrder($data);

              return array(
                  'error' => false,
                  'message' => 'Sales Order cancelled.');
        } else if($order->status_id == 3 || $order->status_id == 5 || $order->status_id == 6) {
              return array(
                  'error' => true,
                  'message' => 'Order is already cancelled');
        } else {
              return array(
                  'error' => true,
                  'message' => 'Order cannot be cancel if the status is not open or pending.');
        }       
    }

    private function checkIfHasWeightTicket($orderId){
        $hasWeightTicket = false;
        $order = Order::with('transportschedule.weightticket')->find($orderId)->toArray();
        // return $order;
        foreach($order['transportschedule'] as $item){
            if($item != null){
                if($item['weightticket']['pickup_id'] != null || $item['weightticket']['dropoff_id'] != null){
                    $hasWeightTicket = true;
                    break;
                }
            }
        }
        return $hasWeightTicket;
    }

    public function getPOStatus(){
        return Status::whereIn('id',array(1,2,4,5,6,7))->get()->toArray(); //return statuses for orders
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

    public function getPOCancellingReasonList(){
        return Reason::whereIn('id',array(1,2,3,4,6))->get()->toArray(); //return statuses for orders
    }

    public function getSOCancellingReasonList(){
        return Reason::whereIn('id',array(1,2,5,6))->get()->toArray(); //return statuses for orders
    }

    public function getTotalWeightDelivered(){}

    public function getOrderWeightDetailsByStack($orderId){
        $order = Order::with('productorder.product')
                        ->with('productorder.transportscheduleproduct.transportschedule.status')
                        ->with('productorder.transportscheduleproduct.transportschedule.weightticket.status')
                        ->with('productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_pickup')
                        ->with('productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_dropoff')
                        ->with('productorder.transportscheduleproduct.weightticketproducts.weightticketscale_type')
                        ->find($orderId);  
 
        // return $order->toArray();
        if($order == null){
            return array(
                'error' => true,
                'message' => "Order not found");
        }
        
        $stackList = array();
        $index = 0;
        foreach($order['productorder'] as $productOrder){
            $stackList[$index]['productName'] = $productOrder['product']['name'];
            $stackList[$index]['stackNumber'] = $productOrder['stacknumber'];
            $stackList[$index]['totalExpected'] = $productOrder['tons'];
            $stackList[$index]['totalDeliveries'] = 0;
            $stackList[$index]['totalReturned'] = $this->getTotalStackReturnedOnOrderUsingStackNumber($order['id'], $productOrder['stacknumber']);
            $stackList[$index]['schedule'] = array();
            $i = 0;
            foreach($productOrder['transportscheduleproduct'] as $transportscheduleproduct){
                $weightTypeToBeUsed = 1; //pickup weight ticket default
                $weightTicket = $transportscheduleproduct['transportschedule']['weightticket'];
                $stackList[$index]['schedule'][$i]['transportschedule_id'] = $transportscheduleproduct['transportschedule_id'];
                $stackList[$index]['schedule'][$i]['transportscheduledate'] = $transportscheduleproduct['transportschedule']['date'];
                $stackList[$index]['schedule'][$i]['transportscheduledate_status'] = $transportscheduleproduct['transportschedule']['status']->toArray();
                $stackList[$index]['schedule'][$i]['expected'] = $transportscheduleproduct['quantity'];
                $stackList[$index]['schedule'][$i]['weightTicketNumber'] = $weightTicket['weightTicketNumber'];
                if($weightTicket['weightTicketNumber']) {
                    $stackList[$index]['schedule'][$i]['weightTicketNumber_status'] = $weightTicket['status']->toArray();
                }

                if($weightTicket['pickup_id'] != null && $weightTicket['dropoff_id'] != null){ //with both pickup and dropoff weight ticket
                   
                    $weightTicketPickup = $weightTicket['weightticketscale_pickup'];
                    $weightTicketDropoff = $weightTicket['weightticketscale_dropoff'];
                    //compute net weight
                    if($weightTicketPickup['gross'] != null && $weightTicketPickup['tare'] != null){
                        //#$pickupNetWeight = number_format($weightTicketPickup['gross'] - $weightTicketPickup['tare'], 4, '.', ''); # 20 April 2015
                        //#$dropoffNetWeight = number_format($weightTicketDropoff['gross'] - $weightTicketDropoff['tare'], 4, '.', ''); # 20 April 2015
                        $pickupNetWeight = number_format(($weightTicketPickup['gross'] - $weightTicketPickup['tare'] ) * 0.0005, 3, '.', ''); # new 20 April 2015
                        $dropoffNetWeight = number_format(($weightTicketDropoff['gross'] - $weightTicketDropoff['tare'] )* 0.0005, 3, '.', ''); # new 20 April 2015
                    } else {
                        $pickupNetWeight = 0;
                        $dropoffNetWeight = 0;
                    }
                    //check if weightticket has more than one product
                    if(count($weightTicketPickup['weightticketproducts']) > 1 || count($weightTicketDropoff['weightticketproducts']) > 1){ //if weight ticket product is more than 1
                        
                        if($pickupNetWeight <= $dropoffNetWeight){
                            $weightTypeToBeUsed = 1; //use pickup weight ticket
                            $stackList[$index]['schedule'][$i]['weighttickettype'] = 1;
                        } else {
                            $weightTypeToBeUsed = 2; //use dropoff weight ticket
                            $stackList[$index]['schedule'][$i]['weighttickettype'] = 2;
                        }
                        $stackList[$index]['schedule'][$i]['delivered'] = $this->getWeightTicketProductTobeUsed($weightTypeToBeUsed, $transportscheduleproduct['weightticketproducts']);
                       
                    } else {
                        if($pickupNetWeight <= $dropoffNetWeight){
                           
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format($pickupNetWeight, 3, '.', '');
                            $stackList[$index]['schedule'][$i]['weighttickettype'] = 1;
                        } else {
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format($dropoffNetWeight, 3, '.', '');
                            $stackList[$index]['schedule'][$i]['weighttickettype'] = 2;
                        }
                    }
                } else if($weightTicket['pickup_id'] != null){ //pickup weighticket only
                   
                    $weightTicketPickup = $weightTicket['weightticketscale_pickup'];
                   
                    if(count($weightTicketPickup['weightticketproducts']) > 1){
                        $stackList[$index]['schedule'][$i]['delivered'] = $this->getWeightTicketProductTobeUsed(1, $transportscheduleproduct['weightticketproducts']);
                    } else {
                        if($weightTicketPickup['gross'] != null && $weightTicketPickup['tare'] != null){
                            //#$stackList[$index]['schedule'][$i]['delivered'] = number_format($weightTicketPickup['gross'] - $weightTicketPickup['tare'], 4, '.', ''); # 21 April 2015
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format(($weightTicketPickup['gross'] - $weightTicketPickup['tare']) * 0.0005, 3, '.', ''); # # new 21 April 2015
                        } else {
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format(0, 3, '.', '');
                        }
                    }
                    $stackList[$index]['schedule'][$i]['weighttickettype'] = 1;
                } else { //dropoff weight ticket only
                    $weightTicketDropoff = $weightTicket['weightticketscale_dropoff'];
    
                    if(count($weightTicketDropoff['weightticketproducts']) > 1){ //if product on weight ticket is more than 1
                        $stackList[$index]['schedule'][$i]['delivered'] = $this->getWeightTicketProductTobeUsed(2, $transportscheduleproduct['weightticketproducts']);
                    } else {
                        if($weightTicketDropoff['gross'] != null && $weightTicketDropoff['tare'] != null){
                            //#$stackList[$index]['schedule'][$i]['delivered'] = number_format($weightTicketDropoff['gross'] - $weightTicketDropoff['tare'], 4, '.', ''); # 21 April 2015
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format(($weightTicketDropoff['gross'] - $weightTicketDropoff['tare']) * 0.0005, 3, '.', ''); # new 21 April 2015
                        } else {
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format(0, 3, '.', '');
                        }
                    }
                    $stackList[$index]['schedule'][$i]['weighttickettype'] = 2;
                }

                $stackList[$index]['totalDeliveries'] += $stackList[$index]['schedule'][$i]['delivered'];
                $i++;

            }

           
            usort($stackList[$index]['schedule'],function($a,$b){ return strtotime($b['transportscheduledate']) - strtotime($a['transportscheduledate']); });

            $stackList[$index]['totalDeliveries'] = number_format($stackList[$index]['totalDeliveries'], 3, '.', '');
            $index++;
        }

        return $stackList;
    }

    private function getTotalStackReturnedOnOrderUsingStackNumber($orderId, $stackNumber){
        $returnedInTons = 0;
        $stack = Stack::where('stacknumber', '=', $stackNumber)->first(array('id'));
        $stackId = $stack['id'];
        $result = Inventory::with(array('inventoryproduct' => function($query) use ($stackId){
                                $query->where('stack_id', '=', $stackId);
                            }))->where('returnedOrder_id', '=', $orderId)->get();
        $result = $result->toArray();
        foreach($result as $inventory){
            foreach($inventory['inventoryproduct'] as $product){
                $returnedInTons += $product['tons'];
            }
        }
        return $returnedInTons;
    }

    private function getWeightTicketProductTobeUsed($type, $weightticketproducts){
        $netWeight = null;
        $weightticketproducts = $weightticketproducts->toArray();
        foreach($weightticketproducts as $weightticketproduct){ //atmost 2 loops, for pickup and dropoff
            if($type == 1 && $weightticketproduct['weightticketscale_type']['type'] == 1){ //check if pickup type
                $netWeight = $this->getNetWeight($weightticketproduct);
                break;
            } else if($type == 2 && $weightticketproduct['weightticketscale_type']['type'] == 2){ //check if dropoff type
                $netWeight = $this->getNetWeight($weightticketproduct);
                break;
            }
        }

        return $netWeight;
    }  

    private function getNetWeight($weightticketproducts){
        $netWeight = number_format($weightticketproducts['pounds'] * 0.0005, 3, '.', ''); //lbs to tons
        return $netWeight;
    }

    //used in creating dropship, need to copy all the product details on PO to be used in SO
    public function getPurchaseOrderProductsForSalesOrder($purchaseOrderId){
        $order = Order::with('contractnumber.accountname.businessaddress.addressstates')
                        ->with('productsummary.productname')
                        ->with('productsummary.productorder.product')
                        // ->with('productsummary.productorder.upload.files')
                        ->with('productsummary.productorder.sectionfrom.storagelocation')
                        ->where('id', '=', $purchaseOrderId)
                        ->first(array('id', 'order_number', 'contract_id'));

        if($order){
            return $order->toArray();
        } else {
            return array(
                "error" => true,
                'message' => "No orders found."
            );
        }
    }
    

    private function createJsonForInventory($data, $ordertype = 1){ //order type is default to PO
        if($ordertype == 1){
            $transactiontype_id = 2; //PO on inventory type
        } else {
            $transactiontype_id = 1; //SO  on inventory type
        }

        $ctr = 0;
        foreach($data['productsummary'] as $product) {
            foreach($product['productorder'] as $stack){
                $productTemp[$ctr]['tons'] = $stack['tons'];
                $productTemp[$ctr]['stacknumber'] = $stack['stacknumber'];
                $productTemp[$ctr]['bales'] = $stack['bales'];
                $productTemp[$ctr]['product_id'] = $stack['product_id'];
                $productTemp[$ctr]['price'] = $stack['unitprice'];
                $productTemp[$ctr]['sectionto_id'] = $stack['sectionfrom']['id'];
                $productTemp[$ctr]['sectionfrom_id'] = $stack['sectionfrom']['id'];
                $ctr++;
            }
        }
        if($ctr > 0){
            $products = array("transactiontype_id" => $transactiontype_id, "order_id" => $data['id'], "products" => $productTemp, "notes" => "From Dropship");    
            return $products;
        } else {
            return array(
                "error" => true,
                'message' => "No product found."
            );
        }
        

        
    }

    public function checkInPurchaseOrderProducts($id, $dropship = true){
        $order = Order::with('productsummary.productorder.sectionfrom')
                // with('productsummary.productname')
                // ->with('productsummary.productorder.product')
                // ->with('productsummary.productorder.sectionfrom.storagelocation')
                ->find($id);

        if($order){
            if($order->status_id == 2){ //order already close, cannot checkin
                return array(
                  'error' => true,
                  'message' => 'Products cannot be recorded in inventory because Purchase Order is already closed.');
            } else {
                $dataInventory = $this->createJsonForInventory($order->toArray());
            if(isset($dataInventory['error'])){
                return $dataInventory;
                } else {
                    //insert to inventory
                    $inventoryResponse = InventoryLibrary::store($dataInventory);
                    if($inventoryResponse['error']){
                        return $inventoryResponse;
                    }
                    //TODO: call the close function for PO
                    //close the PO before creating SO
                    $order->status_id = 2; 
                    $order->save();
                    if($dropship){ 
                        //for dropship type, needs to return products to be use in creating SO
                        //return $this->getPurchaseOrderProductsForSalesOrder($id);    
                        return array(
                          'error' => false,
                          'message' => 'Products successfully recorded in inventory. You can now create Sales Order.',
                          'purchaseorder_id' => $id);
                    } else { //for producer type
                        return array(
                          'error' => false,
                          'message' => 'Products successfully recorded in inventory.');
                    }
                }
            }
        } else {
            return array(
                "error" => true,
                'message' => "There is a problem in recording the products to inventory."
            );
        }
    }

    public function getSalesOrderUsingAccountId($accountId){
        $salesOrder = Order::where('account_id', '=', $accountId)
                            ->where('ordertype', '=', 2)
                            ->where('status_id', '!=', Config::get('constants.STATUS_CLOSED'))
                            ->get(array('id', 'order_number'));
        return $salesOrder->toArray();
    }

}
