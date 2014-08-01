<?php

/**
 * Description of Inventory Lib
 *
 * @author Avs
 */
class InventoryLibrary {

    
    public static function store($data)
    {   
        DB::beginTransaction();
        $inventoryClass = new InventoryLibrary();
        $inventoryClass->validate($data, 'Inventory');
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

        $inventoryProduct = $inventoryClass->addInventoryProduct($inventory->id, $inventory->transactiontype_id, $data['products']);
        
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
            } else if($type == 4 || $type == 1){ //issue type - deduct a stack to stackLocaitonFrom
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
            } else if($type == 5 || $type == 2){ //reciept or PO type - add a stack to stackLocaitonTo
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

    public function validate($data, $entity)
    {   
        $validator = Validator::make($data, $entity::$rules);
       
        if($validator->fails()) { 
            throw new ValidationException($validator); 
        }
        
        return true;
    }
    
}
