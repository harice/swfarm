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
          foreach($item['productorder'] as $productorder){
            if($productorder['unitprice'] != null){
              $item['totalPrice'] += $productorder['unitprice'] * $productorder['tons'];
            }
          }
        }

        return $result;
        
    }

    private function getExpectedDeliveredData($orderId){
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

        foreach($order['productorder'] as $productOrder){
 
            $totalDeliveries = 0;
            $deliveredWeight = 0;
            foreach($productOrder['transportscheduleproduct'] as $transportscheduleproduct){
                $weightTypeToBeUsed = 1; //pickup weight ticket default
                $weightTicket = $transportscheduleproduct['transportschedule']['weightticket'];

                if($weightTicket['pickup_id'] != null && $weightTicket['dropoff_id'] != null){ //with both pickup and dropoff weight ticket
                    $weightTicketPickup = $weightTicket['weightticketscale_pickup'];
                    $weightTicketDropoff = $weightTicket['weightticketscale_dropoff'];
                    //compute net weight
                    if($weightTicketPickup['gross'] != null && $weightTicketPickup['tare'] != null){
                        $pickupNetWeight = number_format($weightTicketPickup['gross'] - $weightTicketPickup['tare'], 4);
                        $dropoffNetWeight = number_format($weightTicketDropoff['gross'] - $weightTicketDropoff['tare'], 4);
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
                            $deliveredWeight = number_format($pickupNetWeight, 4);
                        } else {
                            $deliveredWeight = number_format($dropoffNetWeight, 4);
                        }
                    }
                } else if($weightTicket['pickup_id'] != null){ //pickup weighticket only
                    $weightTicketPickup = $weightTicket['weightticketscale_pickup'];
                   
                    if(count($weightTicketPickup['weightticketproducts']) > 1){
                        $deliveredWeight = $this->getWeightTicketProductTobeUsed(1, $transportscheduleproduct['weightticketproducts']);
                    } else {
                        if($weightTicketPickup['gross'] != null && $weightTicketPickup['tare'] != null){
                            $deliveredWeight = number_format($weightTicketPickup['gross'] - $weightTicketPickup['tare'], 4);
                        } else {
                            $deliveredWeight = number_format(0, 4);
                        }
                    }
                } else { //dropoff weight ticket only
                    $weightTicketDropoff = $weightTicket['weightticketscale_dropoff'];
    
                    if(count($weightTicketDropoff['weightticketproducts']) > 1){ //if product on weight ticket is more than 1
                        $deliveredWeight = $this->getWeightTicketProductTobeUsed(2, $transportscheduleproduct['weightticketproducts']);
                    } else {
                        if($weightTicketDropoff['gross'] != null && $weightTicketDropoff['tare'] != null){
                            $deliveredWeight = number_format($weightTicketDropoff['gross'] - $weightTicketDropoff['tare'], 4);
                        } else {
                            $deliveredWeight = number_format(0, 4);
                        }
                    }
                }

                $totalDeliveries += $deliveredWeight;

            }
            

            $result['delivered'] += $totalDeliveries;
            $result['expected'] += $productOrder['tons'];
        }

        $result['delivered'] = $result['delivered'];
        $result['expected'] = $result['expected'];

        $result['percentage'] = intval(($result['delivered']/$result['expected']) * 100);

        if($result['percentage'] > 100){
            $result['percentage'] = 100;
        }
        return $result['percentage'];
    }
    
    public function getOrder($id, $orderType = 1)
    {
        $order = Order::with('productorder')
                ->with('productorder.product')
                ->with('account')
                ->with('orderaddress', 'orderaddress.addressStates')
                ->with('location')
                ->with('status')
                ->with('ordercancellingreason.reason')
                ->with('productorder.upload.files');

        if($orderType == 2) //for SO only
            $order = $order->with('natureofsale', 'contract');

        $order = $order->where('ordertype', '=', $orderType)->find($id);

        if($order){
            $response = array();
            $response = $order->toArray();
            //adding new index in file array for passing auth
            array_walk($response['productorder'], function(&$productorder) {
                array_walk($productorder['upload'], function (&$upload){
                    array_walk($upload['files'], function (&$files){
                        $userEmail = Auth::user()->email;
                        $userPassword = Request::header('php-auth-pw');
                        $files['auth'] = base64_encode($files['id'].','.$userEmail.','.$userPassword);
                    });
                });
            });
          
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
            $result = array();
            $data['orderaddress_id'] = $this->addOrderAddress($data['businessaddress']);

            $order = $this->instance();
            $order->fill($data);
            $order->save();

            $productResult = $this->addProductOrder($order->id, $data['products']);
            
            if($productResult['hasHoldProduct'] && $data['ordertype'] == 1){ //for purchase order only
                $order->status_id = 7; //Testing status
                $order->save();
            }

            return $order;
        });
        
        if($result){
            if($data['ordertype'] == 1)
                return array(
                    "error" => false,
                    'message' => Lang::get('messages.success.created', array('entity' => 'Purchase Order'))
                );
            else
                return array(
                    "error" => false,
                    'message' => Lang::get('messages.success.created', array('entity' => 'Sales Order'))
                );
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
            $productResult = null;
            $order = Order::find($id);

            $this->addOrderAddress($data['businessaddress'], $order->orderaddress_id); //just editing the address

            $order->fill($data);
            $order->save();

            if(isset($data['products'])){
                $this->deleteProductOrder($id, $data['products']); //delete product order that is remove by client
                $productResult = $this->addProductOrder($order->id, $data['products']);
            } else {
                $this->deleteProductOrder($id, null);
            }

            if($productResult != null && $data['ordertype'] == 1){ //for purchase order only
                if($productResult['hasHoldProduct']){
                    $order->status_id = 7; //Testing status
                } else {
                    $order->status_id = 1; //Open Status
                }
                $order->save();
            }
            return $order;
        });
        
        if($result){
            if($data['ordertype'] == 1)
                return array(
                    "error" => false,
                    'message' => Lang::get('messages.success.updated', array('entity' => 'Purchase Order'))
                );
            else
                return array(
                    "error" => false,
                    'message' => Lang::get('messages.success.updated', array('entity' => 'Sales Order'))
                );
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
        $result = array('hasHoldProduct' => false);

        foreach ($products as $product) {
            $product['order_id'] = $order_id;
            
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
            if(isset($product['id']))
                $productorder = ProductOrder::find($product['id']);
            else
                $productorder = new ProductOrder();

            $productorder->fill($product);
            $productorder->save();

            if(isset($product['uploadedfile'])){
                $this->linkUploadFilesToProductOrder($product['uploadedfile'], $productorder->id);
            }
        }
        return $result;
    }

    private function linkUploadFilesToProductOrder($uploadedfile, $productorderid){
        $oldFileUploaded = Upload::where('entityname', '=', 'productorder')->where('entity_id', '=', $productorderid)->first();
        
        if($oldFileUploaded){ //if has existing file uploaded
            if($uploadedfile == ""){ //pass empty value, need to delete existing file
                if($oldFileUploaded != null) {
                    $oldFileUploaded->delete();
                }
            } else if($uploadedfile != $oldFileUploaded->file_id){ //new file to be uploaded but there is old file already uploaded
                $oldFileUploaded->delete();

                $upload = new Upload;
                $upload->file_id = $uploadedfile;
                $upload->entityname = 'productorder';
                $upload->entity_id = $productorderid;
                $upload->save();

                $file = Files::find($uploadedfile);
                $file->issave = 1;
                $file->save();
            }
        } else { 
            if($uploadedfile != ""){ //pass empty value
                $upload = new Upload;
                $upload->file_id = $uploadedfile;
                $upload->entityname = 'productorder';
                $upload->entity_id = $productorderid;
                $upload->save();
                
                $file = Files::find($uploadedfile);
                $file->issave = 1;
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
        $order = Order::find($id);
       
        if($order->status_id != 2){
            $transportSchedules = TransportSchedule::where('order_id', '=', $id)->get()->toArray();
            $allScheduleIsClose = true;
            foreach($transportSchedules as $schedule){
                if($schedule['status_id'] != 2){ //if schedule is not in close status
                    $allScheduleIsClose = false;
                    break;
                }
            }

            if($allScheduleIsClose){
               
                $order->status_id = 2;
                $order->save();
                // echo "CLOSING";
                return Response::json(array(
                        'error' => false,
                        'message' => 'Order successfully closed')
                , 200);
            } else {
                return Response::json(array(
                        'error' => true,
                        'message' => 'Order has open schedule(s).')
                , 500);
            }
        } else {
            return Response::json(array(
                        'error' => true,
                        'message' => 'Order status is already closed.')
                , 500);
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
                  'message' => 'PO cancelled.');
        } else if($order->status_id == 1 || $order->status_id == 4){ //check if Open or pending, for sales order
              $order->status_id = 3;
              $order->save();

              $this->insertReasonForCancellingOrder($data);

              return array(
                  'error' => false,
                  'message' => 'Order cancelled.');
        } else if($order->status_id == 3 || $order->status_id == 5 || $order->status_id == 6) {
              return array(
                  'error' => false,
                  'message' => 'Order is already cancelled');
        } else {
              return array(
                  'error' => false,
                  'message' => 'Order cannot be cancel if the status is not open or pending.');
        }       
    }
/*
    public function uploadFile($data, $entityname){
          // var_dump($data);
          //$this->validate($data, 'File');

          $rules = array(
            'name' => 'required',
            'type' => 'required',
            'size' => 'required',
            'content' => 'required'
          );

          $validator = Validator::make($data,$rules);
        
          if($validator->fails()) { 
            throw new ValidationException($validator); 
          }

          if(!(strstr($data['type'], 'application/pdf'))){
            return  array(
              'error' => true,
              'message' => 'file extension must be in pdf'
              );
          } else if(intval($data['size']) > 3145728) { //3mb max file size
            return array(
              'error' => true,
              'message' => 'file size exceeded(3MB).'
              );
          }
          
          // $file = new File;
          // $file->fill($data);
          // $file->save();

          $file = new Files;
          $file->name = $data['name'];
          $file->type = $data['type'];
          $file->size = $data['size'];
          $file->content = $data['content'];
          $file->save();

          // $user->profileimg = $this->saveImage($data['imagedata'], $data['imagetype'], $data['username']);
          //define('UPLOAD_DIR', 'images/profile/');
          // $base64img = str_replace('data:'.$data['imagetype'].';base64,', '', $data['imagedata']);
          // $filedecode = base64_decode($base64img);
          // $file = UPLOAD_DIR . $data['username'] . '.jpg';
          // file_put_contents($file, $filedecode);

          return $file->id;
 
   }
*/
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

    public function getPOCancellingReasonList(){
        return Reason::whereIn('id',array(1,2,3,4,6))->get()->toArray(); //return statuses for orders
    }

    public function getSOCancellingReasonList(){
        return Reason::whereIn('id',array(1,2,5,6))->get()->toArray(); //return statuses for orders
    }

    public function getTotalWeightDelivered(){}

    public function getOrderWeightDetailsByStack($orderId){
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
        foreach($order['productorder'] as $productOrder){
            $stackList[$index]['productName'] = $productOrder['product']['name'];
            $stackList[$index]['stackNumber'] = $productOrder['stacknumber'];
            $stackList[$index]['totalExpected'] = $productOrder['tons'];
            $stackList[$index]['totalDeliveries'] = 0;
            $stackList[$index]['schedule'] = array();
            $i = 0;
            foreach($productOrder['transportscheduleproduct'] as $transportscheduleproduct){
                $weightTypeToBeUsed = 1; //pickup weight ticket default
                $weightTicket = $transportscheduleproduct['transportschedule']['weightticket'];
                $stackList[$index]['schedule'][$i]['transportschedule_id'] = $transportscheduleproduct['transportschedule_id'];
                $stackList[$index]['schedule'][$i]['transportscheduledate'] = $transportscheduleproduct['transportschedule']['date'];
                $stackList[$index]['schedule'][$i]['expected'] = $transportscheduleproduct['quantity'];
                $stackList[$index]['schedule'][$i]['weightTicketNumber'] = $weightTicket['weightTicketNumber'];

                if($weightTicket['pickup_id'] != null && $weightTicket['dropoff_id'] != null){ //with both pickup and dropoff weight ticket
                    $weightTicketPickup = $weightTicket['weightticketscale_pickup'];
                    $weightTicketDropoff = $weightTicket['weightticketscale_dropoff'];
                    //compute net weight
                    if($weightTicketPickup['gross'] != null && $weightTicketPickup['tare'] != null){
                        $pickupNetWeight = number_format($weightTicketPickup['gross'] - $weightTicketPickup['tare'], 4);
                        $dropoffNetWeight = number_format($weightTicketDropoff['gross'] - $weightTicketDropoff['tare'], 4);
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
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format($pickupNetWeight, 4);
                            $stackList[$index]['schedule'][$i]['weighttickettype'] = 1;
                        } else {
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format($dropoffNetWeight, 4);
                            $stackList[$index]['schedule'][$i]['weighttickettype'] = 2;
                        }
                    }
                } else if($weightTicket['pickup_id'] != null){ //pickup weighticket only
                    $weightTicketPickup = $weightTicket['weightticketscale_pickup'];
                   
                    if(count($weightTicketPickup['weightticketproducts']) > 1){
                        $stackList[$index]['schedule'][$i]['delivered'] = $this->getWeightTicketProductTobeUsed(1, $transportscheduleproduct['weightticketproducts']);
                    } else {
                        if($weightTicketPickup['gross'] != null && $weightTicketPickup['tare'] != null){
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format($weightTicketPickup['gross'] - $weightTicketPickup['tare'], 4);
                        } else {
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format(0, 4);
                        }
                    }
                    $stackList[$index]['schedule'][$i]['weighttickettype'] = 1;
                } else { //dropoff weight ticket only
                    $weightTicketDropoff = $weightTicket['weightticketscale_dropoff'];
    
                    if(count($weightTicketDropoff['weightticketproducts']) > 1){ //if product on weight ticket is more than 1
                        $stackList[$index]['schedule'][$i]['delivered'] = $this->getWeightTicketProductTobeUsed(2, $transportscheduleproduct['weightticketproducts']);
                    } else {
                        if($weightTicketDropoff['gross'] != null && $weightTicketDropoff['tare'] != null){
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format($weightTicketDropoff['gross'] - $weightTicketDropoff['tare'], 4);
                        } else {
                            $stackList[$index]['schedule'][$i]['delivered'] = number_format(0, 4);
                        }
                    }
                    $stackList[$index]['schedule'][$i]['weighttickettype'] = 2;
                }

                $stackList[$index]['totalDeliveries'] += $stackList[$index]['schedule'][$i]['delivered'];
                $i++;

            }
            $stackList[$index]['totalDeliveries'] = number_format($stackList[$index]['totalDeliveries'], 4);
            $index++;
        }

        return $stackList;
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
        $netWeight = number_format($weightticketproducts['pounds'] * 0.0005, 4); //lbs to tons
        return $netWeight;
    }
    
}
