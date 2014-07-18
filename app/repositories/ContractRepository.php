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
            
            $_contracts = $contracts->get();
            $total_contracts = $_contracts->count();
            
            $contracts_array = $_contracts->toArray();
            foreach ($contracts_array as &$contract) {
                $contract['total_delivered'] = $this->getDeliveredTons($contract['id']);
                
//                $weightticket = $this->weightticket($contract['id']);
//
//                if ($weightticket) {
//                    $contract['total_delivered'] = $weightticket['total_tons_delivered'];
//                }
            }
            
            $result = Paginator::make($contracts_array, $total_contracts, $perPage);
            
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
        $data['user_id'] = 1;
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
//            return $this->getDeliveredTons(1, 'order');
            
            $contract = Contract::with('contractproducts')
                ->find($id);
            if(!$contract) {
                throw new NotFoundException('Contract not found.', 401);
            }
            
            $contract_products = $contract->contractproducts;
            
            $result = $contract_products->toArray();
            foreach($result as &$_result) {
                $_result['total_tons'] = $_result['tons'];
                
                // Get Sales Orders
                $salesorders = $this->getSalesOrders($id, $_result['product_id']);
                $_result['salesorders'] = $salesorders->toArray();
                
                $delivered_tons = 0.000;
//                $_so['delivered_tons'] = 0.0000;
                foreach ($_result['salesorders'] as &$_so) {
                    if ($_so['status_id'] == 2) {
                        $_so['status']['name'] = "Closed";
                        $_so['status']['class'] = "default";
                    } else {
                        $_so['status']['name'] = "Open";
                        $_so['status']['class'] = "success";
                    }
                    
                    $delivered_tons += $this->getDeliveredTons($_so['order_id'], 'order');
                    
//                    $delivered_tons += $this->getDeliveredTonsPerProduct($_so['order_id'], $_so['product_id']);
//                    $delivered_tons += $this->getDeliveredTons($_so['order_id']);
                }
                
                $_result['delivered_tons'] = number_format($delivered_tons, 4);
                $_result['remaining_tons'] = number_format(($_result['tons'] - $delivered_tons), 4);
            }
            unset($_so);
            unset($_result);
            
            return $result;
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
    public function getDeliveredTons($id, $type = null)
    {
        switch ($type) {
            case 'order':
                $order = Order::with('transportschedule.transportscheduleproduct')->find($id);
//                return $order;
                $schedules = $order->transportschedule;
            
            default:
                $contract = Contract::with('schedules.transportscheduleproduct')->find($id);
//                return $contract;
        
                $schedules = $contract->schedules;
//                return $schedules;
        }   
        
        $total_tons_per_schedule = 0.0000;
        foreach ($schedules as $schedule) {
//            return $schedule;
            
            foreach ($schedule->transportscheduleproduct as $transport_schedule_product) {
                $total_tons_per_schedule += $transport_schedule_product->quantity;
            };
        }
        return number_format($total_tons_per_schedule, 4);
    }
    
    /**
     * Get delivered tons per Salesorder
     * 
     * @param type $id Order ID
     * @return type $float
     */
    public function getDeliveredTonsPerOrder($id)
    {
        $salesorder = Order::with('transportschedule')
            ->with('transportschedule.weightticket.weightticketscale_pickup')
            ->with('transportschedule.weightticket.weightticketscale_dropoff')
            ->find($id);
        
        $transport_schedule = $salesorder->transportschedule;
        
        $result = 0.0000;
        foreach ($transport_schedule as $schedule) {
            $weightticket = $schedule->weightticket;
            
            if ($weightticket->weightticketscale_pickup) {
                $pickup_gross = $weightticket->weightticketscale_pickup->gross;
                $pickup_tare = $weightticket->weightticketscale_pickup->tare;
                $pickup_tons = $pickup_gross - $pickup_tare;
            }

            if ($weightticket->weightticketscale_dropoff) {
                $dropoff_gross = $weightticket->weightticketscale_dropoff->gross;
                $dropoff_tare = $weightticket->weightticketscale_dropoff->tare;
                $dropoff_tons = $dropoff_gross - $dropoff_tare;
            }

            $result += $pickup_tons;
        }
        
        return number_format($result, 4);
    }
    
    /**
     * 
     * @param type $id Order ID
     * @return type
     */
    public function getDeliveredTonsOfSchedulePerOrder($id)
    {
        $transport_schedules = TransportSchedule::
            with('transportscheduleproduct')
            ->where('order_id', '=', $id)
            ->get();
//        return $transport_schedules->toArray();
        
        $total_tons_per_schedule = 0.0000;
        foreach ($transport_schedules as $transport_schedule) {
//            return $transport_schedule;
            foreach ($transport_schedule->transportscheduleproduct as $transport_schedule_product) {
                $total_tons_per_schedule += $transport_schedule_product->quantity;
            };
        }
        return number_format($total_tons_per_schedule, 4);
    }
    
    /**
     * Get delivered tons of specific Product within Salesorder
     * 
     * @param type $id Order ID
     * @return type $float
     */
    public function getDeliveredTonsPerProduct($id, $product_id)
    {
//        $weightticket_products = WeightTicketProducts::
//            where('transportScheduleProduct_id', '=', $product_id)
//            ->get();
//        return $weightticket_products->toArray();
//        
//        $weightticket = WeightTicket::with('weightticketscale_pickup')
//            ->with('weightticketscale_dropoff')
//            ->get();
//        return $weightticket->toArray();
        
        $salesorder = Order::with('transportschedule')
            ->with('transportschedule.weightticket.weightticketscale_pickup')
            ->with('transportschedule.weightticket.weightticketscale_dropoff')
            ->find($id);
        
        $transport_schedule = $salesorder->transportschedule;
//        return ($salesorder);
        
        $result = 0.0000;
        foreach ($transport_schedule as $schedule) {
            $weightticket = $schedule->weightticket;
            
            if ($weightticket->weightticketscale_pickup) {
                $pickup_gross = $weightticket->weightticketscale_pickup->gross;
                $pickup_tare = $weightticket->weightticketscale_pickup->tare;
                $pickup_tons = $pickup_gross - $pickup_tare;
            }

            if ($weightticket->weightticketscale_dropoff) {
                $dropoff_gross = $weightticket->weightticketscale_dropoff->gross;
                $dropoff_tare = $weightticket->weightticketscale_dropoff->tare;
                $dropoff_tons = $dropoff_gross - $dropoff_tare;
            }

            $result += $pickup_tons;
        }
        
        return number_format($result, 4);
    }
    
    public function getSalesOrders($contract_id, $product_id = null)
    {
        try
        {
            $orders = Order::
//                with('productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_pickup')
//                ->with('productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_dropoff')
                join('productorder', 'order.id', '=', 'productorder.order_id')
                ->where('contract_id', '=', $contract_id);
            
            if(isset($product_id)) {
                $orders = $orders->where('product_id', '=', $product_id);
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
