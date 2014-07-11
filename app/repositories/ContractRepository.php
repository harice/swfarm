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
            
            $result = $contracts
                ->take($perPage)
                ->offset($offset)
                ->orderBy($sortby, $orderby)
                ->paginate($perPage);
            
            $result = $result->toArray();
            
            if (!empty($result['data'])) {
                $data = $result['data'];
                unset($result['data']);
                foreach ($data as $contract) {
                    $weightticket = $this->weighttickets($contract['id']);

                    if ($weightticket) {
                        $contract['total_delivered'] = $weightticket['total_tons_delivered'];
                    }

                    $result['data'][] = $contract;
                }
            }
            
            return $result;
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
        $data['user_id'] = Auth::user()->id;
        $data['status_id'] = 1;
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
            
            if(!$contract) {
                $response = array(
                    'message' => 'No salesorder'
                );
                
                return $response;
            }
            
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
                    
                    $delivered_tons = 0.0;
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
    
    public function products($id)
    {
        $products = ContractProducts::where('contract_id', '=', $id)
            ->join('products', 'product_id', '=', 'products.id' )
            ->get(array('contract_id', 'product_id', 'name'));
        return $products;
    }
    
    /**
     * 
     * 
     * @return Products
     */
    public function weighttickets($id)
    {
        try
        {
            $delivered_products = WeightTicket::with('weightticketscale_dropoff', 'weightticketscale_pickup')
                ->join('transportschedule', 'transportSchedule_id', '=', 'transportschedule.id')
                ->join('order', 'order_id', '=', 'order.id')
                ->where('contract_id', '=', $id)
                ->get();
            
            $total_bales_delivered = 0;
            $total_gross_delivered = 0.0000;
            $total_tare_delivered = 0.0000;
            foreach ($delivered_products as $product) {
                $total_bales_delivered += $product->weightticketscale_dropoff->bales;
                $total_gross_delivered += $product->weightticketscale_dropoff->gross;
                $total_tare_delivered += $product->weightticketscale_dropoff->tare;
            }
            
            $result = array(
                'delivered_products' => $delivered_products->toArray(),
                'total_tons_delivered' => $total_gross_delivered - $total_tare_delivered,
                'total_bales_delivered' => $total_bales_delivered,
                'total_gross_delivered' => $total_gross_delivered,
                'total_tare_delivered' => $total_tare_delivered
            );
            
            return $result;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
}
