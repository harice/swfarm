<?php

/**
 * Description of ContractRepository
 *
 * @author Das
 */
class ContractRepository implements ContractRepositoryInterface {
    
    public function findAll($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $page     = isset($params['page']) ? $params['page'] : 1;
            $sortby   = isset($params['sortby']) ? $params['sortby'] : 'contract_number';
            $orderby  = isset($params['orderby']) ? $params['orderby'] :'DSC';
            $offset   = $page * $perPage - $perPage;
            $account_id = isset($params['account']) ? $params['account'] : null;
            
            $contracts = Contract::with('salesorders', 'schedules', 'products', 'productorders', 'account', 'account.address', 'status');
            
            if ($account_id) {
                $contracts = $contracts->where('account_id', '=', $account_id);
            }
            
            $response = $contracts
                ->take($perPage)
                ->offset($offset)
                ->orderBy($sortby, $orderby)
                ->paginate($perPage);
            
            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function search($params)
    {
        try
        {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $page     = isset($params['page']) ? $params['page'] : 1;
            $sortby   = isset($params['sortby']) ? $params['sortby'] : 'contract_number';
            $orderby  = isset($params['orderby']) ? $params['orderby'] :'DSC';
            $offset   = $page * $perPage - $perPage;
            $searchWord = $params['search'];
            
            // Set date filters
            $filter = FALSE;
            if (isset($params['date_start']) && isset($params['date_end'])) {
                $filter = TRUE;
            }
                
            $result = Contract::with('products', 'account', 'account.address')
                ->whereHas('account', function($query) use ($searchWord) {
                    $query->where('name', 'like', '%'.$searchWord.'%');
                });
                
            // Filter by date
            if ($filter) {
                $result = $result->whereBetween('contract_date_start', array($params['date_start'], $params['date_end']));
            }
                
            $result = $result->orWhere(function ($query) use ($searchWord) {
                        $query->where('contract_number','like','%'.$searchWord.'%');
                    })
                    ->take($perPage)
                    ->offset($offset)
                    ->orderBy($sortby, $orderby)
                    ->paginate($perPage);
            
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
            $contract = Contract::with('products', 'salesorders', 'productorders', 'account', 'account.address', 'account.address.addressStates', 'account.address.addressType', 'status')->find($id);
            
            if (!$contract) {
                throw new NotFoundException();
            }
            
            return $contract;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function store($data)
    {
        $data['contract_number'] = $this->generateContractNumber('Contract', 'C');
        $this->validate($data);
        
        try
        {
            $contract = DB::transaction(function() use ($data){
                $products = $data['products'];
                unset($data['products']);
                
                $contract = $this->instance();
                $contract->fill($data);
                $contract->save();
                
                $new_products = array();
                foreach ($products as $product)
                {
                    $new_products[$product['product_id']] = array(
                        'tons' => $product['tons'],
                        'bales' => $product['bales']
                    );
                }
                
                $contract->products()->sync($new_products);
                
                return $contract;
            });
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Contract')),
                'data' => $contract
            );
            
            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function update($id, $data)
    {
        $this->validate($data, $id);
        
        try
        {
            $contract = DB::transaction(function() use ($data, $id){
            
                $products = $data['products'];
                unset($data['products']);
                
                $contract = $this->findById($id);
                $contract->fill($data);
                $contract->update();
                
                $new_products = array();
                foreach ($products as $product)
                {
                    $new_products[$product['product_id']] = array(
                        'tons' => $product['tons'],
                        'bales' => $product['bales']
                    );
                }
                
                $contract->products()->sync($new_products);
                
                return $contract;
            });
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Contract')),
                'data' => $contract
            );
            
            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function updateStatus($id, $data)
    {
        if(!isset($data['status_id'])) {
            throw new Exception('Status was not set.', 203);
        }
        
        try
        {
            $contract = $this->findById($id);
            $contract->status_id = $data['status_id'];
            $contract->update();
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Contract'))
            );
            
            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function salesorder($id)
    {
        try
        {
//            $contracts = Contract::with('products', 'salesorders', 'productorders', 'account', 'account.address', 'account.address.addressStates', 'account.address.addressType', 'status')
//                ->find($id);
//            $contract_products = $contracts->products;
//            
//            $products = array();
//            foreach($contract_products as $product) {
//                // var_dump($product->id);
//                $product = Product::find($product->id);
//                
//                $salesorders = Order::with('status')
//                    ->join('productorder', 'order.id', '=', 'productorder.order_id')
//                    ->where('ordertype', '=', 2)
//                    ->where('contract_id', '=', $id)
//                    ->where('product_id', '=', $product->id)
//                    ->get(array('order.id', 'order_number', 'contract_id', 'stacknumber', 'tons', 'bales', 'product_id', 'status_id'));
//                    // ->get();
//                
//                $total_tons = 0;
//                foreach ($salesorders as $order) {
//                    $total_tons += $order->tons;
//                    
//                    $schedules[$order->id] = array_flatten(TransportSchedule::where('order_id', '=', $order->id)->get(array('id'))->toArray());
//                }
//                
//                $products[$product->id] = array(
//                    'product_id' => $product->id,
//                    'product_name' => $product->name,
//                    'total_tons' => $total_tons,
//                    'salesorders' => $salesorders->toArray()
//                );
//            }
//            
//            $weight_tickets = WeightTicket::with('weightticketscale_dropoff')
//                // join('weightticketproducts', 'weightticket.dropoff_id', '=', 'weightticketproducts.id')
//                // ->where('transportSchedule_id', '=', 41)
//                ->get();
//            
//            $result = array(
//                // 'schedules' => $schedules,
//                'weight_tickets' => $weight_tickets->toArray(),
//                'products' => array_values($products)
//            );
//            
//            // return array_values($products);
//            return $result;
            
            $contract = Contract::with('contractproducts.products.productorder.product')
                        ->with('contractproducts.products.productorder.order')
                        ->with('contractproducts.products.productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_pickup')
                        ->with('contractproducts.products.productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_dropoff')
                        ->with('contractproducts.products.productorder.transportscheduleproduct.weightticketproducts.weightticketscale_type')
                        ->whereHas('order', function($query) use ($id)
                        {
                            $query->where('contract_id', '=', $id);

                        })
                        ->find($id);
                        
            $contract_products = $contract->contractproducts;
            
            $result = array();
            foreach($contract_products as $contract_product) {
                $result[$contract_product->product_id] = $contract_product->toArray();
                $result[$contract_product->product_id]['total_tons'] = $contract_product->tons;
                
                $total_delivered_tons = 0.0;
                foreach($contract_product->products as $product) {
                    $result[$contract_product->product_id]['product_name'] = $product->name;
                    $result[$contract_product->product_id]['salesorders'][$product->productorder['id']]['stacknumber'] = $product->productorder['stacknumber'];
                    $result[$contract_product->product_id]['salesorders'][$product->productorder['id']]['order_number'] = $product->productorder->order->order_number;
                    $result[$contract_product->product_id]['salesorders'][$product->productorder['id']]['tons'] = $product->productorder->tons;
                    $result[$contract_product->product_id]['salesorders'][$product->productorder['id']]['status']['name'] = $product->productorder->order->status_id;
                    $result[$contract_product->product_id]['salesorders'][$product->productorder['id']]['status']['class'] = "success";
                    
                    
                    foreach($product->productorder->transportscheduleproduct as $schedule) {
                        $delivered_gross = $schedule->transportschedule->weightticket->weightticketscale_dropoff->gross;
                        $delivered_tare = $schedule->transportschedule->weightticket->weightticketscale_dropoff->tare;
                        
                        $delivered_tons = $schedule->weightticketproducts[1]->pounds / 2000;
                        $total_delivered_tons += $delivered_tons;
                    }
                    
                    $result[$contract_product->product_id]['salesorders'][$product->productorder['id']]['delivered_tons'] = $delivered_tons;
                }
                
                $result[$contract_product->product_id]['delivered_tons'] = $total_delivered_tons;
                $result[$contract_product->product_id]['remaining_tons'] = $contract_product->tons - $total_delivered_tons;
            }
                        
//            $result = array(
//                "product_id" => 1,
//                "product_name" => "Alfalfa",
//                "total_tons" => "1,900.0000",
//                "delivered_tons" => "1,125.0000",
//                "remaining_tons" => "1,775.0000",
//                "salesorders" => array(
//                    array(
//                        "id" => 24,
//                        "order_number" => "S20140630-0004",
//                        "contract_id" => 5,
//                        "stacknumber" => "COW94934949",
//                        "tons" => "50.0000",
//                        "bales" => 5,
//                        "product_id" => 1,
//                        "status_id" => 1,
//                        "status" => array(
//                            "id" => 1,
//                            "name" => "Open",
//                            "class" => "success"
//                        ),
//                        "delivered_tons" => "1,000.0000"
//                    ),
//                    array(
//                        "id" => 31,
//                        "order_number" => "S20140701-0001",
//                        "contract_id" => 5,
//                        "stacknumber" => "S2",
//                        "tons" => "50.0000",
//                        "bales" => 5,
//                        "product_id" => 1,
//                        "status_id" => 1,
//                        "status" => array(
//                            "id" => 1,
//                            "name" => "Open",
//                            "class" => "success"
//                        ),
//                        "delivered_tons" => "1,000.0000"
//                    )
//                )
//            );
            
            return $result;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function destroy($id)
    {
        try
        {
            $contract = $this->findById($id);

            if (!$contract->delete()) {
                return array(
                    'error' => true,
                    'message' => 'Contract was not deleted.'
                );
            }

            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Contract')),
                'data' => $contract
            );
            
            return $response;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function validate($data, $id = null)
    {
        $rules = Contract::$rules;
        
        if ($id) {
            $rules['contract_number'] = 'sometimes|required|unique:contract,contract_number,'.$id;
            $rules['user_id'] = 'sometimes|required';
        }
        
        $validator = Validator::make($data, $rules);
        
        if ($validator->fails()) {
            throw new ValidationException($validator);
        }
        
        return true;
    }
    
    public function instance($data = array())
    {
        return new Contract($data);
    }
    
    function generateContractNumber($model, $prefix){ //type default is PO
        $dateToday = date('Y-m-d');
        $count = $model::where('created_at', 'like', $dateToday.'%')->count()+1;
        return $prefix.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
    }
    
    function products($id)
    {
        $products = ContractProducts::where('contract_id', '=', $id)
            ->join('products', 'product_id', '=', 'products.id' )
            ->get(array('contract_id', 'product_id', 'name'));
        return $products;
    }
    
}
