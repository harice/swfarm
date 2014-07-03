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
            
            $result = Contract::with('salesorders', 'products', 'productorders', 'account', 'account.address', 'status')
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
        $data['contract_number'] = generateControlNumber('Contract', 'C');
        $data['user_id'] = Auth::user()->id;
        $data['status_id'] = 1;
        $this->validate($data);
        
        try
        {
            DB::transaction(function() use ($data){
                $contract = $this->instance();
                $contract->fill($data);
                $contract->save();

                $new_products = array();
                foreach ($data['products'] as $product)
                {
                    $new_products[$product['product_id']] = array(
                        'tons' => $product['tons'],
                        'bales' => $product['bales']
                    );
                }
                
                $contract->products()->sync($new_products);
            });
            
            $response = array(
                'error' => false,
                'message' => Lang::get('messages.success.created', array('entity' => 'Contract'))
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
            DB::transaction(function() use ($data, $id){
                $contract = $this->findById($id);
                $contract->fill($data);
                $contract->update();
                
                $new_products = array();
                foreach ($data['products'] as $product)
                {
                    $new_products[$product['product_id']] = array(
                        'tons' => $product['tons'],
                        'bales' => $product['bales']
                    );
                }
                
                $contract->products()->sync($new_products);
            });
            
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
            $contracts = Contract::with('products', 'salesorders', 'productorders', 'account', 'account.address', 'account.address.addressStates', 'account.address.addressType', 'status')
                ->find($id);
            $contract_products = $contracts->products;
            
            $products = array();
            foreach($contract_products as $product) {
                // var_dump($product->id);
                $product = Product::find($product->id);
                
                $salesorders = Order::with('status')
                    ->join('productorder', 'order.id', '=', 'productorder.order_id')
                    ->where('ordertype', '=', 2)
                    ->where('contract_id', '=', $id)
                    ->where('product_id', '=', $product->id)
                    // ->get(array('order.id', 'order_number', 'contract_id', 'stacknumber', 'tons', 'bales', 'product_id', 'status_id'));
                    ->get();
                
                $total_tons = 0;
                foreach ($salesorders as $order) {
                    $total_tons += $order->tons;
                    
                    $schedules[$order->id] = array_flatten(TransportSchedule::where('order_id', '=', $order->id)->get(array('id'))->toArray());
                }
                
                $products[$product->id] = array(
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'total_tons' => $total_tons,
                    'salesorders' => $salesorders->toArray()
                );
            }
            
//            foreach ($schedules as $schedule) {
//                foreach($schedule as $id) {
//                    $weight_ticket = WeightTicket::where('transportSchedule_id', '=', $id);
//                }
//                $weight_tickets[] += $weight_ticket;
//            }
            
            $result = array_values($products);
            
//            $result = array(
//                // 'schedules' => $schedules,
//                // 'weight_tickets' => $weight_tickets,
//                'products' => array_values($products)
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
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Contract'))
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
    
}
