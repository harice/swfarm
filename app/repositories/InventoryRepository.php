<?php

/**
 * Description of Inventory Repository
 *
 * @author Avs
 */
class InventoryRepository implements InventoryRepositoryInterface {
    
    public function findAll($params)
    {
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $sortby   = isset($params['sortby']) ? $params['sortby'] : 'created_at';
        $orderby  = isset($params['orderby']) ? $params['orderby'] : 'desc';
        $date = isset($params['date']) ? $params['date'] : null; //default date is the present date
        $filter = isset($params['search']) ? $params['search'] : null;
        $type = isset($params['type']) ? $params['type'] : null;
        // $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
        // $offset = $page*$perPage-$perPage;
        $inventory = Inventory::with('inventorytransactiontype')
                                ->with('inventoryproduct.stack.productName');
                                // ->with('inventoryproduct.sectionfrom.storagelocationName')
                                // ->with('inventoryproduct.sectionto.storagelocationName')
                                // ->with('order')
                                // ->with('weightticket');

        if ($filter != null){
            $inventory = $inventory->whereHas('inventoryproduct', function($inventoryproduct) use ($filter){
                                $inventoryproduct->whereHas('stack', function($stack) use ($filter){
                                    $stack->where('stacknumber', 'like', $filter.'%');    
                                });
                            });
                      // ->whereNull('deleted_at');
        }

        if($date != null){
          $inventory = $inventory->where('created_at', 'like', $date.'%'); 
        }

        if($type != null){ //inventory transaction type
          $inventory = $inventory->where('transactiontype_id', '=', $type); 
        }

        $inventory = $inventory->orderBy($sortby, $orderby);
        $inventory = $inventory->paginate($perPage);
                                // ->take($perPage)
                                // ->offset($offset)
                                // ->orderBy($sortby, $orderby)
                                // ->get();

        return $inventory->toArray();
    }

    //used in receipt operation when product is returned, must limit the products to be selected
    public function getProductsOfOrder($order_id){
          $orderproducts = ProductOrder::with('product')->where('order_id', '=', $order_id)->get(array('id', 'stacknumber', 'product_id'))->toArray();

          return $orderproducts;
    }

    /*public function getStackListByProduct($params){
        $productId = $params['productId'];
        // $stackList = Stack::with('stacklocation.section')
        //                     ->with('productName')->where('product_id', '=', $productId)->orderBy('stacknumber', 'ASC')->get();
        $result = array();
        $index = 0;
        $products = Product::with('stack.stacklocation.section.storagelocationName')->where('id', '=', $productId)->first();
        if($products){
            $products = $products->toArray();
            // return $products;
            foreach($products['stack'] as $stack){
                $result[$index]['stacknumber'] = $stack['stacknumber'];
                $result[$index]['stacklocation'] = "";
                $result[$index]['onHandTons'] = 0;
                foreach($stack['stacklocation'] as $stacklocation){
                    $result[$index]['stacklocation'] .= $stacklocation['section'][0]['storagelocation_name']['name']." - ".$stacklocation['section'][0]['name']." | ";
                    $result[$index]['onHandTons'] += $stacklocation['tons'];
                }
                $result[$index]['stacklocation'] = substr($result[$index]['stacklocation'], 0, -2); //remove extra | on last
                $index++;
            }
        } else {
            return array(
                'error' => true,
                'message' => 'Product not found.'
            );
        }
        

        return $result;
    }*/

    /*public function getStackListByProduct($params){
        $productId = $params['productId'];
        // $stackList = Stack::with('stacklocation.section')
        //                     ->with('productName')->where('product_id', '=', $productId)->orderBy('stacknumber', 'ASC')->get();
        $result = array();
        
        
        $products = Product::with('stack.stacklocation.section.storagelocationName')->orderBy('name', 'ASC');
        if($productId != null){
            $products = $products->where('id', '=', $productId);
        }
        $products = $products->get();

        if($products){
            $products = $products->toArray();
            // return $products;
            $productCnt = 0;
            foreach($products as $product){
                $index = 0;
                $result[$productCnt]['ProductName'] = $product['name'];
                foreach($product['stack'] as $stack){
                    $result[$productCnt][$index]['stacknumber'] = $stack['stacknumber'];
                    $result[$productCnt][$index]['stacklocation'] = "";
                    $result[$productCnt][$index]['onHandTons'] = 0;
                    foreach($stack['stacklocation'] as $stacklocation){
                        $result[$productCnt][$index]['stacklocation'] .= $stacklocation['section'][0]['storagelocation_name']['name']." - ".$stacklocation['section'][0]['name']." | ";
                        $result[$productCnt][$index]['onHandTons'] += $stacklocation['tons'];
                    }
                    $result[$productCnt][$index]['stacklocation'] = substr($result[$productCnt][$index]['stacklocation'], 0, -2); //remove extra | on last
                    $index++;
                }
                $productCnt++;
            }
        } else {
            return array(
                'error' => true,
                'message' => 'Product not found.'
            );
        }
        

        return $result;
    }*/
    /* latest
    public function getStackListByProduct($params){
        $productId = isset($params['productId']) ? $params['productId'] : null;
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        // $stackList = Stack::with('stacklocation.section')
        //                     ->with('productName')->where('product_id', '=', $productId)->orderBy('stacknumber', 'ASC')->get();
        $result = array();
        $index = 0;
        // $products = Product::with('stack.stacklocation.section.storagelocationName')->where('id', '=', $productId)->first();
        $products = Product::with('stack.stacklocation.section.storagelocationName')->orderBy('name', 'ASC');
        if($productId != null){
            $products = $products->where('id', '=', $productId);
        }
        $products = $products->get();

        if($products){
            $products = $products->toArray();
            foreach($products as $product){
                foreach($product['stack'] as $stack){
                    $result[$index]['productname'] = $product['name'];
                    $result[$index]['stacknumber'] = $stack['stacknumber'];
                    $result[$index]['stacklocation'] = "";
                    $result[$index]['onHandTons'] = 0;
                    foreach($stack['stacklocation'] as $stacklocation){
                        $result[$index]['stacklocation'] .= $stacklocation['section'][0]['storagelocation_name']['name']." - ".$stacklocation['section'][0]['name']." | ";
                        $result[$index]['onHandTons'] += $stacklocation['tons'];
                    }
                    $result[$index]['stacklocation'] = substr($result[$index]['stacklocation'], 0, -2); //remove extra | on last
                    $index++;
                }
            }
        } else {
            return array(
                'error' => true,
                'message' => 'Product not found.'
            );
        }
        return $result;
    }*/


    public function getStackListByProduct($params){
        $productId = isset($params['productId']) ? $params['productId'] : null;
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $stackList = Stack::with('stacklocation.section.storagelocationName.address.state')
                            ->with('productName')
                            ->with('account')
                            ->has('stacklocation');
        if($productId != null) {
            $stackList = $stackList->where('product_id', '=', $productId);
        }
        $stackList = $stackList->orderBy('stacknumber', 'ASC')->paginate($perPage)->toArray();

        $result = array();
       
        if($stackList['data']){
            $result['total'] = $stackList['total'];
            $result['per_page'] = $stackList['per_page'];
            $result['current_page'] = $stackList['current_page'];
            $result['last_page'] = $stackList['last_page'];
            $result['from'] = $stackList['from'];
            $result['to'] = $stackList['to'];
            $result['data'] = array();
            $index = 0;
            foreach($stackList['data'] as $product){
                // if($product['stacklocation'] == null){
                //     continue;
                // }
                $result['data'][$index]['committed'] = number_format($this->getCommittedByStack($product['stacknumber']), 3);
                $result['data'][$index]['ordered'] = number_format($this->getOrderedByStack($product['stacknumber']), 3);

                $result['data'][$index]['productname'] = $product['product_name']['name'];
                $result['data'][$index]['stacknumber'] = $product['stacknumber'];
                $result['data'][$index]['unitprice'] = $product['unitprice'];
                $result['data'][$index]['producer'] = $product['account']['name'];
                $result['data'][$index]['stacklocation'] = "";
                $result['data'][$index]['onHandTons'] = 0;
                foreach($product['stacklocation'] as $stacklocation){
                    if($stacklocation['tons'] != 0) {
                        if(!isset($result['data'][$index]['cityState'])){
                            $result['data'][$index]['cityState'] = $stacklocation['section'][0]['storagelocation_name']['address']['city'].", ".$stacklocation['section'][0]['storagelocation_name']['address']['state']['state'];    
                        }
                        $result['data'][$index]['stacklocation'] .= $stacklocation['section'][0]['storagelocation_name']['name']." - ".$stacklocation['section'][0]['name']." | ";
                        $result['data'][$index]['onHandTons'] += $stacklocation['tons'];
                    }                        
                }
                $result['data'][$index]['available'] = number_format($result['data'][$index]['onHandTons'] - $result['data'][$index]['committed'] + $result['data'][$index]['ordered'], 3);
                $result['data'][$index]['stacklocation'] = substr($result['data'][$index]['stacklocation'], 0, -2); //remove extra | on last
                $index++;
            }
        }

        return $result;
    }

    private function getOrderedByStack($stacknumber){
        $data = ProductOrder::with('order.transportschedule.weightticket.weightticketscale_pickup.weightticketproducts')
                            ->with('order.transportschedule.weightticket.weightticketscale_dropoff.weightticketproducts')
                            ->whereHas('order', function($order) {
                                $order->where('status_id', '=', 1);
                                $order->where('ordertype', '=', 1);
                            })->where('stacknumber', 'like', $stacknumber)->get();

        $data = $data->toArray();
        
        $totalWeightDelivered = 0;
        $totalQuantity = 0;
        foreach($data as $productOrder){
            $order = $productOrder['order'];
            $schedules = $productOrder['order']['transportschedule'];

            foreach($schedules as $transportschedule){
                $totalQuantity += $this->getScheduleQuantity($transportschedule['id'], $productOrder['id']);

                if($transportschedule['weightticket'] != null){
                    if($transportschedule['weightticket']['pickup_id'] != null){
                        $scale = $transportschedule['weightticket']['weightticketscale_pickup'];
                    } else if($transportschedule['weightticket']['dropoff_id'] != null) {
                        $scale = $transportschedule['weightticket']['weightticketscale_dropoff'];
                    } else {
                        $scale = null;
                    }

                    if($scale != null){
                        $transportScheduleProductId = $this->getTransportScheduleProductId($transportschedule['id'], $productOrder['id']);
                        $totalWeightDelivered += $this->getWeightOfStackInInventoryGoesThroughPO($scale['id'], $transportScheduleProductId);
                    }
                }
            }
        }
        
        $ordered = $totalQuantity - ($totalWeightDelivered * 0.0005);
        return $ordered;
    }

    private function getTransportScheduleProductId($transportscheduleId, $productorderId){
        $result = TransportScheduleProduct::where('transportschedule_id', '=', $transportscheduleId)
                                            ->where('productorder_id', '=', $productorderId)
                                            ->first(array('id'));

        return $result['id'];
    }

    private function getWeightOfStackInInventoryGoesThroughPO($scaleId, $transportscheduleproductId){
        $scaleData = WeightTicket::where('pickup_id', '=', $scaleId)
                                    ->orWhere('dropoff_id', '=', $scaleId)
                                    ->first(array('id', 'status_id'));
        if($scaleData->status_id == 2) { //already push in inventory
            $result = WeightTicketProducts::where('weightTicketScale_id', '=', $scaleId)
                                    ->where('transportScheduleProduct_id', '=', $transportscheduleproductId)
                                    ->first(array('id', 'pounds'));

            if($result != null){
                return $result->pounds;    
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }


    private function getCommittedByStack($stacknumber){
        $data = ProductOrder::with('order.transportschedule.weightticket.weightticketscale_pickup.weightticketproducts')
                            ->with('order.transportschedule.weightticket.weightticketscale_dropoff.weightticketproducts')
                            ->whereHas('order', function($order) {
                                $order->where('status_id', '=', 1);
                                $order->where('ordertype', '=', 2);
                            })->where('stacknumber', 'like', $stacknumber)->get();

        $data = $data->toArray();
        
        $totalWeightDelivered = 0;
        $totalQuantity = 0;
        foreach($data as $productOrder){
            $order = $productOrder['order'];
            $schedules = $productOrder['order']['transportschedule'];

            foreach($schedules as $transportschedule){
                $totalQuantity += $this->getScheduleQuantity($transportschedule['id'], $productOrder['id']);

                if($transportschedule['weightticket'] != null){
                    if($transportschedule['weightticket']['pickup_id'] != null){
                        $scale = $transportschedule['weightticket']['weightticketscale_pickup'];
                    } else if($transportschedule['weightticket']['dropoff_id'] != null) {
                        $scale = $transportschedule['weightticket']['weightticketscale_dropoff'];
                    } else {
                        $scale = null;
                    }

                    if($scale != null){
                        $transportScheduleProductId = $this->getTransportScheduleProductId($transportschedule['id'], $productOrder['id']);
                        $totalWeightDelivered += $this->getWeightOfStackInInventoryGoesThroughSO($scale['id'], $transportScheduleProductId);
                    }
                }
            }
        }
        
        $commited = $totalQuantity - ($totalWeightDelivered * 0.0005);
        return $commited;
    }

    private function getWeightOfStackInInventoryGoesThroughSO($scaleId, $transportscheduleId){
        $scaleData = WeightTicket::where('pickup_id', '=', $scaleId)
                                    ->orWhere('dropoff_id', '=', $scaleId)
                                    ->first(array('id', 'checkout'));
        if($scaleData->checkout == 1) { //already push in inventory
            $result = WeightTicketProducts::where('weightTicketScale_id', '=', $scaleId)
                                    ->where('transportScheduleProduct_id', '=', $transportscheduleId)
                                    ->first(array('id', 'pounds'));
            if($result != null){
                return $result->pounds;    
            } else {
                return 0;
            }
        } else {
            return 0;
        }
    }

    private function getScheduleQuantity($transportscheduleId, $productorderId){
        $result = TransportScheduleProduct::where('transportschedule_id', '=', $transportscheduleId)
                    ->where('productorder_id', '=', $productorderId)->first(array('id','quantity'));
        if($result){
            return $result->quantity;    
        } else {
            return 0;
        }
        
    }
/*
    public function getInventorySummaryByStack($params){
        $stacknumber = $params['stacknumber'];
        $inventory = Inventory::with('inventorytransactiontype')
                                ->with('inventoryproduct.stack.productName')
                                ->with('inventoryproduct.stack.stacklocation')
                                ->whereHas('inventoryproduct', function ($inventoryproduct) use ($stacknumber){
                                    $inventoryproduct->whereHas('stack', function ($stack) use ($stacknumber){
                                        $stack->where('stacknumber', 'like', $stacknumber);
                                    });
                                })->get();
                                // return $inventory->toArray();
        if($inventory){
            $inventory = $inventory->toArray();
            $result = array();
            $index = 0;
            foreach($inventory as $item){
                $result['stacknumber'] = $stacknumber;
                $result[$index]['transactionDate'] = $item['created_at'];
                $result[$index]['transactionType'] = $item['inventorytransactiontype']['type'];
                foreach($item['inventoryproduct'] as $product){
                    $result['productname'] = $product['stack']['product_name']['name'];
                    if($product['stack']['stacknumber'] == $stacknumber){
                        $result[$index]['totalDelivered'] = "";
                        if($item['inventorytransactiontype']['id'] == 3){
                            $result[$index]['totalDelivered'] = "0"; //as is because its transfer
                        } else if($item['inventorytransactiontype']['id'] == 4){
                            $result[$index]['totalDelivered'] = "-".$product['tons'];
                        } else if($item['inventorytransactiontype']['id'] == 5){
                            $result[$index]['totalDelivered'] = "+".$product['tons'];
                        }
                        
                        break;
                    }
                }
                $index++;
            }
        }
       
        return $result;
    }*/

    public function getInventorySummaryByStack($params){
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST'); //default, see app/config/constants
        $stacknumber = $params['stacknumber'];
        
        $inventoryProduct = InventoryProduct::with('inventory.inventorytransactiontype')
                                            ->with('inventory.ordernumber')
                                            ->with('inventory.weightticketnumber')
                                            ->with('stack.stacklocation.section')
                                            ->with('stack.productName')
                                            ->wherehas('stack', function($stack) use ($stacknumber){
                                                $stack->where('stacknumber', 'like', $stacknumber);
                                            })->paginate($perPage)->toArray();
        $result = array();

        if($inventoryProduct['data']){
            $result['total'] = $inventoryProduct['total'];
            $result['per_page'] = $inventoryProduct['per_page'];
            $result['current_page'] = $inventoryProduct['current_page'];
            $result['last_page'] = $inventoryProduct['last_page'];
            $result['from'] = $inventoryProduct['from'];
            $result['to'] = $inventoryProduct['to'];
            $index = 0;
            $result['stacknumber'] = $stacknumber;
            $result['onHandTons'] = $this->getTotalDelivered($stacknumber);
            foreach($inventoryProduct['data'] as $product){
                $result['data'][$index]['transactionDate'] = $product['inventory']['created_at'];
                $result['data'][$index]['transactionType'] = $product['inventory']['inventorytransactiontype']['type'];
                $result['productname'] = $product['stack']['product_name']['name'];
                $result['data'][$index]['ordernumber_id'] = $product['inventory']['ordernumber']['id'];
                $result['data'][$index]['ordernumber'] = $product['inventory']['ordernumber']['order_number'];
                $result['data'][$index]['weightticketnumber'] = $product['inventory']['weightticketnumber']['weightTicketNumber'];
                $result['data'][$index]['transportschedule_id'] = $product['inventory']['weightticketnumber']['transportSchedule_id'];
                if($product['inventory']['transactiontype_id'] == 3){
                     $result['data'][$index]['totalDelivered'] = "0"; //as is because its transfer
                 } else if($product['inventory']['transactiontype_id'] == 4 || $product['inventory']['transactiontype_id'] == 1){ //issue and SO
                    $result['data'][$index]['totalDelivered'] = "-".$product['tons'];
                } else if($product['inventory']['transactiontype_id'] == 5  || $product['inventory']['transactiontype_id'] == 2){ //receipt and PO
                    $result['data'][$index]['totalDelivered'] = "+".$product['tons'];
                }
                $index++;
            }
        }
        
        return $result;
    }

    private function getTotalDelivered($stacknumber){
        $inventoryProduct = InventoryProduct::with('inventory')
                                            ->wherehas('stack', function($stack) use ($stacknumber){
                                                $stack->where('stacknumber', 'like', $stacknumber);
                                            })->get();
        $totalDelivered = 0;
        if($inventoryProduct){
            $inventoryProduct = $inventoryProduct->toArray();
            foreach($inventoryProduct as $product){
                $transactionType = $product['inventory']['transactiontype_id'];
                if($transactionType == 4 || $transactionType == 1){
                    $totalDelivered -= $product['tons'];
                } else if($transactionType == 5 || $transactionType == 2){
                    $totalDelivered += $product['tons'];
                }
            }
        }

        return $totalDelivered;
    }
    
    public function findById($id)
    {
        $inventory = Inventory::with('inventorytransactiontype')
                                ->with('inventoryproduct.stack.productName')
                                ->with('inventoryproduct.sectionfrom.storagelocationName')
                                ->with('inventoryproduct.sectionto.storagelocationName')
                                ->with('order')
                                ->with('weightticket')
                                ->find($id);
        
        if (!$inventory) {
            return array(
                'error' => true,
                'message' => 'Inventory not found.'
            );
        }
        
        return $inventory->toArray();
        
    }

    public function store($data){
        return InventoryLibrary::store($data);
    }
/*    
    public function store($data)
    {   
        DB::beginTransaction();
        $this->validate($data, 'Inventory');
        if($data['notes'] == ""){
            $data['notes'] = "";
        }
        $inventory = new Inventory;
        $inventory->fill($data);

        if (!$inventory->save()) {
            return array(
                'error' => true,
                'message' => 'An error occur while saving to inventory.'
            );
        }

        $inventoryProduct = $this->addInventoryProduct($inventory->id, $inventory->transactiontype_id, $data['products']);
        
        if(is_array($inventoryProduct)){
            DB::rollback();
            return $inventoryProduct;
        }
        if($inventoryProduct){
            DB::commit();
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Inventory'))
            );
        } else {
            DB::rollback();
            $response = array(
                'error' => true,
                'message' => "A problem was encountered while saving stacks in inventory.");
        }

        return $response;
        
    }

    private function addInventoryProduct($inventory_id, $type, $products = array())
    {
        foreach ($products as $product) {
            //save the stack data to stack table first
            $stackId = $this->addToStack($product, $type);
            if(is_array($stackId)){
                return $stackId; //error message
            }
            if(isset($product['sectionfrom_id'])){
                if($product['sectionfrom_id'] == ''){
                    $product['sectionfrom_id'] = null;
                }
            } else{
                $product['sectionfrom_id'] = null;
            }
            if(isset($product['sectionto_id'])){
                if($product['sectionto_id'] == ''){
                    $product['sectionto_id'] = null;
                }
            } else {
                $product['sectionto_id'] = null;
            }


            if($type == 4){ //if issue type, no need for section to
                $product['sectionto_id'] == null;
            }

            if($type == 5){ //if receipt type, no need for section from
                $product['sectionfrom_id'] == null;
            }


            if($product['sectionfrom_id'] == $product['sectionto_id']) {
                return array(
                    'error' => true,
                    'message' => "Stack location from and to cannot be the same.");
            }
            $product['inventory_id'] = $inventory_id;
            $product['stack_id'] = $stackId;

            $this->validate($product, 'InventoryProduct');
            if(isset($product['id'])) {
                $inventoryProduct = InventoryProduct::find($product['id']);
            }
            else {
                $inventoryProduct = new InventoryProduct;
            }

            
            $inventoryProduct->fill($product);
            $inventoryProduct->save();

        }

        return true;
    }

    //contains a lot of logic
    private function addToStack($product, $type){
        $this->validate($product, 'Stack');
        //check the stack number in stack table first if it exist
        $stack = Stack::where('stacknumber', 'like', $product['stacknumber'])->first();
        if(!$stack){ //if stack number does't exist
            //insert new stack and stack location data
            $stackData['stacknumber'] = $product['stacknumber'];
            $stackData['product_id'] = $product['product_id'];
            $stack = new Stack;
            $stack->fill($stackData);
            $stack->save();
        }
        if($stack){ //if stack number exist
            if($type == 3){ //transfer type
                $stacklocationFrom = StackLocation::where('stack_id', '=', $stack->id)->where('section_id', '=', $product['sectionfrom_id'])->first();
                $stacklocationTo = StackLocation::where('stack_id', '=', $stack->id)->where('section_id', '=', $product['sectionto_id'])->first();

                if($stacklocationFrom){
                    if($stacklocationFrom->tons < $product['tons']){
                        return array(
                            'error' => true,
                            'message' => "Weight tons is not enough on this stack (".$stack->stacknumber.") to be transfered. Current weight: ".$stacklocationFrom->tons." Weight to tranfer: ".$product['tons']);
                    } else {
                        $stacklocationFrom->tons = $stacklocationFrom->tons - $product['tons'];
                        $stacklocationFrom->save(); 
                    }
                } else {
                    return array(
                            'error' => true,
                            'message' => "Stack number ".$stack->stacknumber." not found on the location you specified.");
                }

                if($stacklocationTo){
                    $stacklocationTo->tons = $stacklocationTo->tons + $product['tons'];
                    $stacklocationTo->save();
                } else {
                    $stackLocationData['stack_id'] = $stack->id;
                    $stackLocationData['section_id'] = $product['sectionto_id'];
                    $stackLocationData['tons'] = $product['tons'];
                    $stacklocation = new StackLocation;
                    $stacklocation->fill($stackLocationData);
                    $stacklocation->save();
                }
            } else if($type == 4){ //issue type - deduct a stack to stackLocaitonFrom
                $stacklocationFrom = StackLocation::where('stack_id', '=', $stack->id)->where('section_id', '=', $product['sectionfrom_id'])->first();
                if($stacklocationFrom){
                    if($stacklocationFrom->tons < $product['tons']){
                        return array(
                            'error' => true,
                            'message' => "Weight tons is not enough on this stack (".$stack->stacknumber.") to be issued.");
                    } else {
                        $stacklocationFrom->tons = $stacklocationFrom->tons - $product['tons'];
                        $stacklocationFrom->save();
                    }
                } else {
                    return array(
                            'error' => true,
                            'message' => "Stack (".$stack->stacknumber.") not found. Cannot make issue operation.");
                }
            } else if($type == 5){ //reciept type - add a stack to stackLocaitonTo
                $stacklocationTo = StackLocation::where('stack_id', '=', $stack->id)->where('section_id', '=', $product['sectionto_id'])->first();
                if($stacklocationTo){
                    $stacklocationTo->tons = $stacklocationTo->tons + $product['tons'];
                    $stacklocationTo->save();
                } else {
                    $stackLocationData['stack_id'] = $stack->id;
                    $stackLocationData['section_id'] = $product['sectionto_id'];
                    $stackLocationData['tons'] = $product['tons'];
                    $stacklocation = new StackLocation;
                    $stacklocation->fill($stackLocationData);
                    $stacklocation->save();
                }
            }
            
        } else { //if stack with the stack numbers doesn't exist
           return array(
                'error' => true,
                'message' => "Stack not yet created.");
        }
        
        //if exist
            //check if the stack number on the table found has the same section id of the stack number you about to save
            //if has same section id
                //add the value of tons to the existing stack number with the same section id
            //if does not have the same section
                //create another stack location using the old record of stack
        //if not exist
            //just insert a new stack to stack table and stack location

        
        return $stack->id;
    }
*/
    private function removeSection($storagelocation_id, $sections = array())
    {
        // $existingSectionId = array();
        // if($sections != null){
        //     foreach($sections as $item){
        //         $sectionData = $item;
        //         if(isset($sectionData['id'])){
        //             $existingSectionId[] = $sectionData['id'];
        //         }
        //     }
        // }

        // if($existingSectionId == null){ //delete all section associated with this storage location
        //     $result = Section::with('storagelocation')
        //             ->whereHas('storagelocation', function($query) use ($storagelocation_id)
        //             {
        //                 $query->where('id', '=', $storagelocation_id);

        //             })
        //             ->delete();
        // } else { //delete section that is included in array
        //     $result = Section::with('storagelocation')
        //             ->whereHas('storagelocation', function($query) use ($storagelocation_id)
        //             {
        //                 $query->where('id', '=', $storagelocation_id);

        //             })
        //             ->whereNotIn('id',$existingSectionId)
        //             ->delete();
        // }
        // return $result;
    }
    
    public function update($id, $data)
    {   
        // DB::beginTransaction();
        // $this->validate($data, 'StorageLocation');
        // $storagelocation = StorageLocation::find($id);
        // // var_dump(storagelocation);
        // $storagelocation->fill($data);
        
        // if (!$storagelocation->update()) {
        //     return array(
        //         'error' => true,
        //         'message' => 'Storage location was not updated.'
        //     );
        // }

        // if(isset($data['sections']) && count($data['sections']) > 0){
        //     $removeSectionResult = $this->removeSection($id, $data['sections']); //delete sections that is remove by client
        //     $sectionResult = $this->addSection($storagelocation->id, $data['sections']);
            
        //     if($sectionResult){
        //         DB::commit();
        //         return Response::json(array(
        //             'error' => false,
        //             'message' => Lang::get('messages.success.updated', array('entity' => 'Storage location'))
        //         ));
        //     } else {
        //         DB::rollback();
        //         return Response::json(array(
        //             'error' => true,
        //             'message' => "A problem was encountered while saving section"), 500);
        //     }
        // } else {
        //     DB::rollback();
        //     return Response::json(array(
        //         'error' => true,
        //         'message' => "Atleast one section is required"), 500);
        // }
    }
    
    public function destroy($id)
    {
        // $storagelocation = StorageLocation::find($id);
        // if($storagelocation){
        //     $storagelocation->delete();
        //     return array(
        //     'error' => false,
        //     'message' => Lang::get('messages.success.deleted', array('entity' => 'Storage location'))
        // );
        // } else {
        //      return array(
        //         'error' => true,
        //         'message' => 'Storage location was not found.'
        //     );
        // }
        
    }

    // public function validate($data, $id = null)
    // {
    //     $rules = StorageLocation::$rules;

    //     // $rules = array(
    //     //     'account_id' => 'required',
    //     //     'name' => 'required|unique:storagelocation,name,'.$data['account_id'].',account_id',
    //     //     'description' => 'max:250'
    //     // );

    //     $validator = Validator::make($data, $rules);
        
    //     if ($validator->fails()) {
    //         throw new ValidationException($validator);
    //     }
        
    //     return true;
    // }

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
        return new Inventory($data);
    }

    public function getInventoryTransactionType(){
        $types = array(3, 4, 5); //transfer, issue and reciept only
        $transactionType = InventoryTransactionType::whereIn('id', $types)->get();
        return $transactionType->toArray();
    }

    // public function getStackList($stacknumber){
    //     $stackList = Stack::where('stacknumber', 'like', '%'.$stacknumber.'%')->orderBy('stacknumber', 'ASC')->get();
    //     return $stackList->toArray();
    // }

    public function getStackList($productId = null, $accountId = null){
        if($productId != null && $accountId != null){
            $stackList = Stack::with('stacklocation.section')->where('product_id', '=', $productId)->where('account_id', '=', $accountId)->orderBy('stacknumber', 'ASC')->get(array('id', 'stacknumber', 'unitprice'));    
        } else if($productId != null && $accountId == null) {
            $stackList = Stack::with('stacklocation.section')->where('product_id', '=', $productId)->orderBy('stacknumber', 'ASC')->get(array('id', 'stacknumber', 'unitprice'));    
        } else {
            $stackList = Stack::with('stacklocation.section')->orderBy('stacknumber', 'ASC')->get(array('id', 'stacknumber', 'unitprice'));    
        }
        
        return $stackList->toArray();
    }

    /*public function inventoryReportPerLocation($stacklocationId){
        $result = StorageLocation::with('section.inventoryproduct_sectionto.inventory.inventorytransactiontype')
                                ->with('section.inventoryproduct_sectionto.inventory.ordernumberForInventory.account')
                                ->with('section.inventoryproduct_sectionfrom.inventory.inventorytransactiontype')
                                ->with('section.inventoryproduct_sectionfrom.inventory.ordernumberForInventory.contractnumber')
                                ->with('section.inventoryproduct_sectionto.inventory.weightticketnumber')
                                // ->wherehas('section', function($section){
                                //     $section->whereHas('inventoryproduct_sectionto', function($inventoryproduct_sectionto){
                                //         $inventoryproduct_sectionto->whereHas('order', function($order){
                                //             //$order->where('created_at', '>=', );
                                //         });
                                //     });
                                // })
                                ->find($stacklocationId);
        // return $result->toArray();
        if($result){
            $data = array();
            $index = 0;
            $data['location'] = $result['name'];
            $data['totalBales'] = 0;
            $data['totalTons'] = 0;
            $data['totalCost'] = 0;
            foreach($result['section'] as $section){
                foreach($section['inventoryproduct_sectionto'] as $inventoryproduct){
                    $date = $inventoryproduct['inventory']['created_at'];
                    $data['data'][$index]['section'] = $section['name'];
                    $data['data'][$index]['date'] = $date->createFromFormat('Y-m-d H:i:s', $date)->format('Y-m-d H:i:s');
                    $data['data'][$index]['ordernumber'] = $inventoryproduct['inventory']['ordernumberForInventory']['order_number'] != null ? $inventoryproduct['inventory']['ordernumberForInventory']['order_number'] : "";
                    $data['data'][$index]['weightticketnumber'] = $inventoryproduct['inventory']['weightticketnumber']['weightTicketNumber'] != null ? $inventoryproduct['inventory']['weightticketnumber']['weightTicketNumber'] : "";
                    $data['data'][$index]['producer'] = $inventoryproduct['inventory']['ordernumberForInventory']['order_number'] != null ? $inventoryproduct['inventory']['ordernumberForInventory']['account']['name'] : "";
                    $data['data'][$index]['contract'] = $inventoryproduct['inventory']['ordernumberForInventory']['contract_id'] != null ? $inventoryproduct['inventory']['ordernumberForInventory']['contract']['contract_number'] : "";
                    $data['data'][$index]['bales'] = $inventoryproduct['bales'] != null ? $inventoryproduct['bales'] : "0";
                    $data['data'][$index]['tons'] = $inventoryproduct['tons'];
                    $data['data'][$index]['price'] = $inventoryproduct['price'];
                    $data['data'][$index]['cost'] = number_format($inventoryproduct['tons'] * $inventoryproduct['price'], 2);
                    $data['data'][$index]['operation'] = $inventoryproduct['inventory']['inventorytransactiontype']['type'];
                    $data['totalBales'] += $data['data'][$index]['bales'];
                    $data['totalTons'] += $data['data'][$index]['tons'];
                    $data['totalCost'] += $data['data'][$index]['cost'];
                    $index++;
                }
                foreach($section['inventoryproduct_sectionfrom'] as $inventoryproduct){
                    $date = $inventoryproduct['inventory']['created_at'];
                    $data['data'][$index]['section'] = $section['name'];
                    $data['data'][$index]['date'] = $date->createFromFormat('Y-m-d H:i:s', $date)->format('Y-m-d H:i:s');
                    $data['data'][$index]['ordernumber'] = $inventoryproduct['inventory']['ordernumberForInventory']['order_number'] != null ? $inventoryproduct['inventory']['ordernumberForInventory']['order_number'] : "";
                    $data['data'][$index]['weightticketnumber'] = $inventoryproduct['inventory']['weightticketnumber']['weightTicketNumber'] != null ? $inventoryproduct['inventory']['weightticketnumber']['weightTicketNumber'] : "";
                    $data['data'][$index]['producer'] = $inventoryproduct['inventory']['ordernumberForInventory']['order_number'] != null ? $inventoryproduct['inventory']['ordernumberForInventory']['account']['name'] : "";
                    $data['data'][$index]['contract'] = $inventoryproduct['inventory']['ordernumberForInventory']['contract_id'] != null ? $inventoryproduct['inventory']['ordernumberForInventory']['contract']['contract_number'] : "";
                    $data['data'][$index]['bales'] = $inventoryproduct['bales'] != null ? $inventoryproduct['bales'] : 0;
                    $data['data'][$index]['tons'] = $inventoryproduct['tons'];
                    $data['data'][$index]['price'] = $inventoryproduct['price'];
                    $data['data'][$index]['cost'] = number_format($inventoryproduct['tons'] * $inventoryproduct['price'], 2);
                    $data['data'][$index]['operation'] = $inventoryproduct['inventory']['inventorytransactiontype']['type'];
                    $data['totalBales'] += $data['data'][$index]['bales'];
                    $data['totalTons'] += $data['data'][$index]['tons'];
                    $data['totalCost'] += $data['data'][$index]['cost'];
                    $index++;
                }

            }

            $data['totalBales'] = number_format($data['totalBales'], 0, '.', '');
            $data['totalTons'] = number_format($data['totalTons'], 2, '.', '');
            $data['totalCost'] = number_format($data['totalCost'], 2, '.', '');
            return $data;
        } else {
            return array('error' => true, 'message' => 'Location not found.');
        }
        
    }*/

    private function displayLastQuery(){
      $queries = DB::getQueryLog();
      $last_query = end($queries);
      var_dump($last_query);
  }
    
}
