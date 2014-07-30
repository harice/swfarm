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
            $searchWord = isset($params['search']) ? $params['search'] : null;
            $account_id = isset($params['account']) ? $params['account'] : null;
            
            $contracts = Contract::join('account', 'contract.account_id', '=', 'account.id')
                ->select(
                    'contract.id',
                    'contract.contract_number',
                    'contract.contract_date_start',
                    'contract.contract_date_end',
                    'contract.status_id',
                    'contract.created_at',
                    'account.name as account_name'
                )
                ->with('salesorders', 'schedules', 'products', 'productorders', 'account', 'account.address', 'status');
            
            if ($searchWord) {
                $contracts = $contracts->where(function ($query) use ($searchWord) {
                    $query->orWhere('contract_number','like','%'.$searchWord.'%')
                          ->orWhere('account.name','like','%'.$searchWord.'%');
                });
            }
            
            // Filter by Account
            if ($account_id) {
                $contracts = $contracts->where('account_id', '=', $account_id);
            }
            
            // Filter by Date
            if (isset($params['contract_date_start']) && isset($params['contract_date_end']))
            {
                $contracts = $contracts->whereBetween('contract_date_start', array($params['contract_date_start'], $params['contract_date_end']));
            }
            
            $_contracts = $contracts->orderBy($sortby, $orderby)->get();
            $total_contracts = $_contracts->count();
            
            $contracts_array = $_contracts->toArray();
            foreach ($contracts_array as &$contract) {
                $contract['total_expected'] = 0.0000;
                foreach ($contract['products'] as $product) {
                    $contract['total_expected'] += $product['pivot']['tons'];
                }
                
                $contract['total_delivered'] = $this->getDeliveredTons($contract['id']);
                $contract['total_delivered_percentage'] = number_format((($contract['total_delivered'] / $contract['total_expected']) * 100));
            }
            
            $contracts_array = array_slice($contracts_array, $offset, $perPage);
            $result = Paginator::make($contracts_array, $total_contracts, $perPage);
            
            return $result;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    public function findById($id)
    {
        $contract = Contract::with('products', 'salesorders', 'productorders', 'account', 'account.address', 'account.address.addressStates', 'account.address.addressType', 'status')->find($id);

        if ($contract) {
            return $contract;
        }
        
        throw new NotFoundException('Contract was not found.');
    }
    
    public function store($data)
    {
        $data['contract_number'] = $this->generateContractNumber('Contract', 'C');
        $data['user_id'] = 1;
        $data['status_id'] = 1;
        $this->validate($data);
        
        try
        {
            $contract = DB::transaction(function() use ($data){
                if (!isset($data['products'])) {
                    return array(
                        'error' => true,
                        'message' => 'Please add products for this contract.'
                    );
                }
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
            
            if ($this->hasOpenOrders($id)) {
                return array(
                    'error' => true,
                    'message' => 'Contract cannot be closed while having Open Sales Orders.'
                );
            }
            
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
    
    public function hasOpenOrders($id)
    {
        $contract = $this->findById($id);
        foreach($contract->salesorders as $salesorder) {
            if ($salesorder->status_id != 2) {
                return true;
            }
        }
        
        return false;
    }
    
    /**
     * 
     * @param type $id Contract ID
     * @return type
     * @throws NotFoundException
     */
    public function salesorder($id)
    {
        try
        {
            $contract = Contract::with('contractproducts')
                ->find($id);
            
            if(!$contract) {
                throw new NotFoundException('Contract not found.', 401);
            }
            
            $contract_products = $contract->contractproducts;
            
            if(!$contract_products) {
                throw new NotFoundException('No products found for this contract.', 401);
            }
            
            if ($contract_products) {
                $products = $contract_products->toArray();
                foreach($products as $i => &$_product) {
                    $_product['total_tons'] = $_product['tons'];
                    $delivered_tons = 0.000;

                    $product = Product::find($_product['product_id']);
                    $_product['product_name'] = $product->name;

                    // Get Sales Orders
                    $salesorders = $this->getSalesOrders($id, $_product['product_id']);
                    $_product['salesorders'] = $salesorders->toArray();
                    
                    // Process SO
                    foreach ($_product['salesorders'] as &$_so) {
                        if ($_product['product_id']) {
                            
                        }
                        
                        $_so['tons'] = 0.000;
                        $_so['delivered_tons'] = 0.0000;
                        
                        if ($_so['status_id'] == 2) {
                            $_so['status']['name'] = "Closed";
                            $_so['status']['class'] = "default";
                        } else {
                            $_so['status']['name'] = "Open";
                            $_so['status']['class'] = "success";
                        }
                        
                        if ($_so['transportschedule']) {
                            foreach ($_so['transportschedule'] as $schedule) {

                                foreach ($schedule['transportscheduleproduct'] as $transportscheduleproduct) {
                                    if ($transportscheduleproduct['productorder']['product_id'] == $_product['product_id']) {
                                        // Stack Number
                                        $_so['stacknumber'] = $transportscheduleproduct['productorder']['stacknumber'];
                                        
                                        // Expected Quantity per SO
                                        $_so['tons'] = $transportscheduleproduct['productorder']['tons'];
                                        
                                        // Delivered Quantity per SO
                                        if ($transportscheduleproduct['weightticketproducts']) {
                                            // Check if Weight Ticket was closed.
                                            if ($transportscheduleproduct['weightticketproducts'][0]['weightticketscale']['pickup']['status_id'] == 2) {
                                                $_so['delivered_tons'] = $transportscheduleproduct['weightticketproducts'][0]['pounds'] * 0.0005;
                                            }
                                        }
                                    }
                                }
                            }
                        }

                        $delivered_tons += $_so['delivered_tons'];
                    }
                    unset($_so);
                    
                    $_product['delivered_tons'] = $delivered_tons;
                    $_product['remaining_tons'] = number_format(($_product['tons'] - $delivered_tons), 4);
                }
                unset($_product);

                return $products;
            }
            
            return array(
                'error' => true,
                'message' => 'Something went wrong.'
            );
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
    /**
     * Get delivered tons per Contract
     * 
     * @param type $id
     * @return type $float
     */
    public function getDeliveredTons($id)
    {
        $total_tons = 0.0000;
        $salesorders = $this->getSalesOrders($id);
        $_contract['salesorders'] = $salesorders->toArray();
//        return $_contract;
        
        foreach ($_contract['salesorders'] as $salesorder) {
            foreach ($salesorder['transportschedule'] as $schedule) {
                foreach ($schedule['transportscheduleproduct'] as $transportscheduleproduct) {
                    foreach ($transportscheduleproduct["weightticketproducts"] as $product) {
                        if ($product['weightticketscale']['pickup']['status_id'] == 2) {
                            $total_tons += $product['pounds'] * 0.0005;
                        }
                    }
                }
            }
        }
        return $total_tons;
    }
    
    public function getSalesOrders($contract_id, $product_id = null)
    {
        try
        {
            $orders = Order::with('transportschedule.transportscheduleproduct.weightticketproducts')
                ->with('transportschedule.transportscheduleproduct.weightticketproducts.weightticketscale.pickup')
                ->with('transportschedule.transportscheduleproduct.productorder')
                ->where('contract_id', '=', $contract_id);
                
            if ($product_id) {
                $orders = $orders->whereHas('productorder', function($q) use($product_id)
                {
                    $q->where('product_id', '=', $product_id);
                });
            }
            
            $orders = $orders->get();
            
            if(!$orders) {
                throw new NotFoundException('No Orders found for this contract.', 401);
            }
            
            return $orders;
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
    public function weightticket($id)
    {
        try
        {
            return 0.0000;
            
            $delivered_products = WeightTicket::with('weightticketscale_dropoff', 'weightticketscale_pickup')
                ->join('transportschedule', 'transportSchedule_id', '=', 'transportschedule.id')
                ->join('order', 'order_id', '=', 'order.id')
                ->where('contract_id', '=', $id)
                ->get();
            
            $total_dropoff_bales_delivered = $total_pickup_bales_delivered = 0;
            $total_dropoff_gross_delivered = $total_pickup_gross_delivered = 0.0000;
            $total_dropoff_tare_delivered = $total_pickup_tare_delivered = 0.0000;
            
            foreach ($delivered_products as $product) {
                $total_dropoff_bales_delivered += $product->weightticketscale_dropoff->bales;
                $total_dropoff_gross_delivered += $product->weightticketscale_dropoff->gross;
                $total_dropoff_tare_delivered += $product->weightticketscale_dropoff->tare;
                
                $total_pickup_bales_delivered += $product->weightticketscale_pickup->bales;
                $total_pickup_gross_delivered += $product->weightticketscale_pickup->gross;
                $total_pickup_tare_delivered += $product->weightticketscale_pickup->tare;
            }
            
            $result = array(
                'delivered_products' => $delivered_products->toArray(),
                'total_tons_delivered' => $total_pickup_gross_delivered - $total_pickup_tare_delivered,
                'total_bales_delivered' => $total_pickup_bales_delivered,
                'total_gross_delivered' => $total_pickup_gross_delivered,
                'total_tare_delivered' => $total_pickup_tare_delivered
            );
            
            return $result;
        }
        catch (Exception $e)
        {
            return $e->getMessage();
        }
    }
    
}
