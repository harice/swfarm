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
        // $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
        // $offset = $page*$perPage-$perPage;
        $inventory = Inventory::with('inventorytransactiontype')
                                ->with('inventoryproduct.stack.productName')
                                ->with('inventoryproduct.sectionfrom.storagelocationName')
                                ->with('inventoryproduct.sectionto.storagelocationName')
                                ->with('order')
                                ->with('weightticket');

        if ($filter != null){
            // $inventory = $inventory->where(function($query) use ($filter){
            //              $query->orWhereHas('account', function($query) use ($filter){
            //                   $query->where('name', 'like', '%'.$filter.'%');

            //               })
            //               ->orWhere(function ($query) use ($filter){
            //                   $query->orWhere('order_number','like','%'.$filter.'%');
            //               });
            //           });

            $inventory = $inventory->whereHas('inventoryproduct', function($query) use ($filter)
                            {
                                $query->whereHas('stack', function($stack) use ($filter){
                                    $query->where('stacknumber', 'like', $$filter);    
                                });
                            });
                      // ->whereNull('deleted_at');
        }

        if($date != null){
          $inventory = $inventory->where('created_at', 'like', $date.'%'); 
        }

        $inventory = $inventory->orderBy($sortby, $orderby);
        $inventory = $inventory->paginate($perPage);
                                // ->take($perPage)
                                // ->offset($offset)
                                // ->orderBy($sortby, $orderby)
                                // ->get();

        return $inventory->toArray();
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
        
        return $inventory   ->toArray();
        
    }
    
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
        // var_dump($inventoryProduct);
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
            }
            if(isset($product['sectionto_id'])){
                if($product['sectionto_id'] == ''){
                    $product['sectionto_id'] = null;
                }
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
            /*
            $stacklocation = StackLocation::where('stack_id', '=', $stack->id)->first();
            if($stacklocation){ //if stack number found on a stack location
                //just add the tons value
                $stacklocation->tons = $stacklocation->tons + $product['tons'];
                $stacklocation->save();
            } else { //create new stack location
                $stackLocationData['stack_id'] = $stack->id;
                $stackLocationData['section_id'] = $product['sectionto_id'];
                $stackLocationData['tons'] = $product['tons'];
                $stacklocation = new StackLocation;
                $stacklocation->fill($stackLocationData);
                $stacklocation->save();
            }*/
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
        return new StorageLocation($data);
    }

    public function getInventoryTransactionType(){
        $types = array(3, 4, 5); //transfer, issue and reciept only
        $transactionType = InventoryTransactionType::whereIn('id', $types)->get();
        return $transactionType->toArray();
    }

    public function getStackList($stacknumber){
        $stackList = Stack::where('stacknumber', 'like', '%'.$stacknumber.'%')->orderBy('stacknumber', 'ASC')->get();
        return $stackList->toArray();
    }
    
}
