<?php

class ReportRepository implements ReportRepositoryInterface {
    
    /**
     * Generate a Producer Statement Report
     * 
     * @param int $id Producer Id
     * @param array $params Input
     * @return mixed
     */
    public function generateCustomerSales($id, $params)
    {
        $transactions = TransportSchedule::join('transportscheduleproduct', 'transportschedule_id', '=', 'transportschedule.id')
             ->join('weightticketproducts', function($q) use ($params)
            {
                $q->on('transportScheduleProduct_id', '=', 'transportscheduleproduct.id');
                
                if (isset($params['dateStart']) && isset($params['dateEnd'])) {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '>', $params['dateStart']);
                    $q->where('weightticketproducts.created_at', '<', $date_end);
                } elseif (isset($params['dateStart'])) {
                    $q->where('weightticketproducts.created_at', '>=', $params['dateStart']);
                } elseif (isset($params['dateEnd'])) {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '<=', $date_end);
                }
            })
            ->join('productorder', 'transportscheduleproduct.productorder_id', '=', 'productorder.id')
            ->join('products', 'productorder.product_id', '=', 'products.id')
            ->join('order', 'transportschedule.order_id', '=', 'order.id')
            ->join('natureofsale', 'order.natureofsale_id', '=', 'natureofsale.id')
            ->join('weightticket', 'transportschedule.id', '=', 'weightticket.transportSchedule_id')
            ->leftJoin('section', 'section.id', '=', 'productorder.section_id')
            ->leftJoin('storagelocation', 'section.storagelocation_id', '=', 'storagelocation.id');
        
        $transactions = $transactions->where('order.account_id', '=', $id);
            
        $transactions = $transactions->select(
            'storagelocation.id as storagelocation_id',
            'storagelocation.name as storagelocation_name',
            'natureofsale.name as natureofsale',
            'weightticketproducts.created_at',
            'weightticket.weightTicketNumber',
            'products.name as product_name',
            'weightticketproducts.bales',
            'weightticketproducts.pounds',
            'productorder.unitprice'
        );
        
        $report['customer'] = Account::with('address')->find($id)->toArray();
        $report['summary']['total_transactions'] = $transactions->count();
        $report['summary']['total_bales'] = $transactions->sum('weightticketproducts.bales');
        $report['summary']['total_pounds'] = $transactions->sum('weightticketproducts.pounds');
        $report['transactions'] = $transactions->get()->toArray();
        
        return $report;
    }
    
    /**
     * Generate a Producer Statement Report
     * 
     * @param int $id Producer Id
     * @param array $params Input
     * @return mixed
     */
    public function generateProducerStatement($id, $params)
    {
        $transactions = TransportSchedule::join('transportscheduleproduct', 'transportschedule_id', '=', 'transportschedule.id')
             ->join('weightticketproducts', function($q) use ($params)
            {
                $q->on('transportScheduleProduct_id', '=', 'transportscheduleproduct.id');
                
                if (isset($params['dateStart']) && isset($params['dateEnd'])) {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '>', $params['dateStart']);
                    $q->where('weightticketproducts.created_at', '<', $date_end);
                } elseif (isset($params['dateStart'])) {
                    $q->where('weightticketproducts.created_at', '>=', $params['dateStart']);
                } elseif (isset($params['dateEnd'])) {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '<=', $date_end);
                }
            })
            ->join('productorder', 'transportscheduleproduct.productorder_id', '=', 'productorder.id')
            ->join('products', 'productorder.product_id', '=', 'products.id')
            ->join('order', 'transportschedule.order_id', '=', 'order.id')
            ->join('weightticket', 'transportschedule.id', '=', 'weightticket.transportSchedule_id')
            ->leftJoin('section', 'section.id', '=', 'productorder.section_id')
            ->leftJoin('storagelocation', 'section.storagelocation_id', '=', 'storagelocation.id');
        
        $transactions = $transactions->where('order.account_id', '=', $id);
            
        $transactions = $transactions->select(
            'storagelocation.id as storagelocation_id',
            'storagelocation.name as storagelocation_name',
            'weightticketproducts.created_at',
            'weightticket.weightTicketNumber',
            'products.name as product_name',
            'weightticketproducts.bales',
            'weightticketproducts.pounds',
            'productorder.unitprice'
        );
        
        $report['producer'] = Account::with('address')->find($id)->toArray();
        $report['summary']['total_transactions'] = $transactions->count();
        $report['summary']['total_bales'] = $transactions->sum('weightticketproducts.bales');
        $report['summary']['total_pounds'] = $transactions->sum('weightticketproducts.pounds');
        $report['transactions'] = $transactions->get()->toArray();
        
        return $report;
    }
    
    /**
     * Generate an Operator Pay Report
     * 
     * @param int $id Contact ID
     * @return mixed $report
     */
    public function generateOperatorPay($id, $params)
    {
        // Get load origin
        $contact_origin = Contact::with(
            array(
                'loadOrigin' => function($q) use ($params) {
                    $q->with('order.account');
                    if (isset($params['dateStart']) && isset($params['dateEnd'])) {
                        $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
//                        $q->whereBetween('created_at', array($params['dateStart'], $date_end));
                        $q->where('created_at', '>', $params['dateStart']);
                        $q->where('created_at', '<', $date_end);
                    } elseif (isset($params['dateStart'])) {
                        $q->where('created_at', '>=', $params['dateStart']);
                    } elseif (isset($params['dateEnd'])) {
                        $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                        $q->where('created_at', '<=', $date_end);
                    }
                }
            )
        );
        
        $contact_origin = $contact_origin->where('id', '=', $id);
        
        $contact_origin = $contact_origin->first();
        if (!$contact_origin) {
            throw new Exception('Contact not found.');
        }
        
        $contact_origin = $contact_origin->toArray();
        
        // Get load destination
        $contact_destination = Contact::with(
            array(
                'loadDestination' => function($q) use ($params) {
                    $q->with('order.account');
                    if (isset($params['dateStart']) && isset($params['dateEnd'])) {
                        $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                        $q->where('created_at', '>', $params['dateStart']);
                        $q->where('created_at', '<', $date_end);
                    } elseif (isset($params['dateStart'])) {
                        $q->where('created_at', '>=', $params['dateStart']);
                    } elseif (isset($params['dateEnd'])) {
                        $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                        $q->where('created_at', '<=', $date_end);
                    }
                }
            )
        );
        
        $contact_destination = $contact_destination->where('id', '=', $id);
        
        $contact_destination = $contact_destination->first();
        if (!$contact_destination) {
            throw new Exception('Contact not found.');
        }
        
        $contact_destination = $contact_destination->toArray();
        
        $loads = array();
        $i = 0;
        $total = 0.00;
        foreach ($contact_origin['load_origin'] as $load) {
            $item['id'] = $i;
            $item['type'] = 'Load';
            $item['amount'] = $load['originloaderfee'];
            $item['account_name'] = $load['order']['account']['name'];
            $item['created_at'] = date('Y-m-d', strtotime($load['created_at']));
            
            $loads[] = $item;
            $total += $item['amount'];
            $i++;
        }
        
        foreach ($contact_destination['load_destination'] as $load) {
            $item['id'] = $i;
            $item['type'] = 'Unload';
            $item['amount'] = $load['destinationloaderfee'];
            $item['account_name'] = $load['order']['account']['name'];
            $item['created_at'] = date('Y-m-d', strtotime($load['created_at']));
            
            $loads[] = $item;
            $total += $item['amount'];
            $i++;
        }
        
        $report['operator'] = Contact::find($id)->toArray();
        $report['summary']['total'] = $total;
        $report['transactions'] = $loads;
        
        return $report;
    }
    
    /**
     * Generate a Trucking Statement Report
     * 
     * @param int $id
     * @param array $params
     * @return array
     */
    public function generateTruckingStatement($id, $params)
    {
        $transactions = Truck::join('transportschedule', 'truck_id', '=','truck.id')
            ->join('transportscheduleproduct', 'transportschedule_id', '=', 'transportschedule.id')
            ->join('weightticketproducts', function($q) use ($params)
            {
                $q->on('transportScheduleProduct_id', '=', 'transportscheduleproduct.id');
                
                if (isset($params['dateStart']) && isset($params['dateEnd'])) {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
//                    $q->whereBetween('weightticketproducts.created_at', array($params['dateStart'], $date_end));
                    $q->where('weightticketproducts.created_at', '>', $params['dateStart']);
                    $q->where('weightticketproducts.created_at', '<', $date_end);
                } elseif (isset($params['dateStart'])) {
                    $q->where('weightticketproducts.created_at', '>=', $params['dateStart']);
                } elseif (isset($params['dateEnd'])) {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '<=', $date_end);
                }
            })
            ->join('productorder', 'productorder_id', '=', 'productorder.id');
        
        $transactions = $transactions->leftJoin('section as section_origin', 'productorder.section_id', '=','section_origin.id')
            ->leftJoin('section as section_destination', 'transportscheduleproduct.sectionto_id', '=', 'section_destination.id')
            ->join('storagelocation as storagelocation_origin', 'section_origin.storagelocation_id', '=', 'storagelocation_origin.id')
            ->leftJoin('storagelocation as storagelocation_destination', 'section_destination.storagelocation_id', '=', 'storagelocation_destination.id');
        
        $transactions = $transactions->join('contact as loader_origin', 'transportschedule.originloader_id', '=', 'loader_origin.id')
            ->join('contact as loader_destination', 'transportschedule.destinationloader_id', '=', 'loader_destination.id');
        
        $transactions = $transactions->join('weightticketscale', 'weightticketproducts.weightTicketScale_id', '=', 'weightticketscale.id');
        
        $transactions = $transactions->where('truck.id', '=', $id);
        
        $transactions = $transactions->select(
            'weightticketproducts.bales',
            'weightticketproducts.pounds',
            'weightticketproducts.created_at',
            'transportschedule.truckingrate',
            'transportschedule.trailerrate',
            'transportschedule.fuelcharge',
            
            'section_destination.id as section_destination_id',
            'section_destination.name as section_destination_name',
            'storagelocation_destination.name as storagelocation_destination_name',
            
            'section_origin.id as section_origin_id',
            'section_origin.name as section_origin_name',
            'storagelocation_origin.name as storagelocation_origin_name',
            
            'transportschedule.originloaderfee as loader_origin_fee',
            'loader_origin.firstname as loader_origin_firstname',
            'loader_origin.lastname as loader_origin_lastname',
            'loader_origin.suffix as loader_origin_suffix',
            
            'transportschedule.destinationloaderfee as loader_destination_fee',
            'loader_destination.firstname as loader_destination_firstname',
            'loader_destination.lastname as loader_destination_lastname',
            'loader_destination.suffix as loader_destination_suffix',
            
            'weightticketscale.type as loading_type'
        );
        
        $truck = Truck::find($id)->toArray();
        
        $total_transactions = $transactions->count();
        $total_bales = $transactions->sum('weightticketproducts.bales');
        $total_pounds = $transactions->sum('weightticketproducts.pounds');
        $total_trailer_rent = $transactions->sum('transportschedule.trailerrate');
        $total_loading_fee_origin = $transactions->sum('transportschedule.originloaderfee');
        $total_loading_fee_destination = $transactions->sum('transportschedule.destinationloaderfee');
        $total_loading_fee = $total_loading_fee_origin + $total_loading_fee_destination;
        $total_fuel_fee = $transactions->sum('transportschedule.fuelcharge');
        $total_admin_fee = $total_transactions * $truck['fee'];
        $total_hauling_fee = $total_admin_fee + $total_fuel_fee + $total_loading_fee + $total_trailer_rent;
        
        $transactions = $transactions->get();
        
        $report['truck'] = $truck;
        $report['summary']['total_transactions'] = $total_transactions;
        $report['summary']['total_bales'] = $total_bales;
        $report['summary']['total_pounds'] = $total_pounds;
        $report['summary']['total_trailer_rent'] = $total_trailer_rent;
        $report['summary']['total_loading_fee'] = $total_loading_fee;
        $report['summary']['total_fuel_fee'] = $total_fuel_fee;
        $report['summary']['total_admin_fee'] = $total_admin_fee;
        $report['summary']['total_hauling_fee'] = $total_hauling_fee;
        $report['summary']['total_statement'] = $total_bales + $total_pounds + $total_hauling_fee;
        $report['transactions'] = $transactions->toArray();
        
        return $report;
    }
    
    /**
     * Generate all transport schedules.
     * 
     * @param array $params
     * @return Collection
     */
    public function generateTransportSchedules($params)
    {
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $sortby = isset($params['sortby']) ? $params['sortby'] : 'date';
        $orderby = isset($params['orderby']) ? $params['orderby'] : 'DESC';
        
        $transportSchedules = TransportSchedule::with('trucker')
            ->with('status')
            ->with('originloader')
            ->with('destinationloader')
            ->with('trucker.accountidandname.accounttype')
            ->with('truckvehicle')
            ->with('originloader.accountidandname')
            ->with('destinationloader.accountidandname')
            ->with('trailer.account')
            ->with('transportscheduleproduct.productorder.product')
            ->with('weightticket')
            ->with('transportscheduleproduct.sectionto.storagelocation')
            ->orderBy($sortby,$orderby)
            ->paginate($perPage);
        
        return $transportSchedules;
    }
    
    /**
     * Generate transactions
     * 
     * @param array $params
     * @return mixed
     */
    public function generateTransactions($params)
    {
        $weightticket_products = WeightTicketProducts::with('transportscheduleproduct.transportschedule.truck');
        
        $weightticket_products = $weightticket_products->select(
            'weightticketproducts.id',
            'weightticketproducts.bales',
            'weightticketproducts.pounds',
            'weightticketproducts.transportScheduleProduct_id'
        );
        
        $weightticket_products = $weightticket_products->get();
        
        $transactions['weightticket_products'] = $weightticket_products->toArray();
        
        return $transactions;
    }
    
    /**
     * Generate driver's pay
     * 
     * @param int $id Contact Id
     * @param array $params
     * @return mixed
     */
    public function generateDriverPay($id, $params)
    {
        $transactions = TransportSchedule::join('contact', 'trucker_id', '=', 'contact.id')
            ->join('account', 'contact.account', '=', 'account.id')
            ->join('transportscheduleproduct', 'transportschedule_id', '=', 'transportschedule.id')
            ->join('weightticketproducts', function($q) use ($params)
            {
                $q->on('transportScheduleProduct_id', '=', 'transportscheduleproduct.id');
                
                if (isset($params['dateStart']) && isset($params['dateEnd'])) {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '>', $params['dateStart']);
                    $q->where('weightticketproducts.created_at', '<', $date_end);
                } elseif (isset($params['dateStart'])) {
                    $q->where('weightticketproducts.created_at', '>=', $params['dateStart']);
                } elseif (isset($params['dateEnd'])) {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '<=', $date_end);
                }
            });
        
        $transactions = $transactions->where('transportschedule.trucker_id', '=', $id);
        
        $transactions = $transactions->select(
            'account.name as account_name',
            'weightticketproducts.bales',
            'weightticketproducts.pounds',
            'weightticketproducts.created_at',
            'transportschedule.truckingrate as trucking_rate',
            'contact.rate as driver_rate'
        );
        
        $total_bales = $transactions->sum('weightticketproducts.bales');
        $total_pounds = $transactions->sum('weightticketproducts.pounds');
        
        $transactions = $transactions->get();
        
        $report['driver'] = Contact::find($id)->toArray();
        $report['summary']['total_transactions'] = $transactions->count();
        $report['summary']['total_bales'] = $total_bales;
        $report['summary']['total_pounds'] = $total_pounds;
        $report['transactions'] = $transactions->toArray();
        
        return $report;
    }

    public function inventoryReportPerLocation($data){
        $storageLocationId = $data['storagelocationId'];
        // var_dump(date( 'Y-m-d'. ' 00:00:00', strtotime($data['dateFrom'])));
        // var_dump(date( 'Y-m-d'.' 23:59:59', strtotime($data['dateTo'])));
        // var_dump(date('Y-m-d', strtotime($data['dateFrom'])));
        $storageLocation = StorageLocation::with('section.inventoryproduct_sectionto.inventory.inventorytransactiontype')
                                        ->with('section.inventoryproduct_sectionto.inventory.ordernumberForInventory.account')
                                        ->with('section.inventoryproduct_sectionto.inventory.weightticketnumber')
                                        ->with('section.inventoryproduct_sectionfrom.inventory.inventorytransactiontype')
                                        ->with('section.inventoryproduct_sectionfrom.inventory.ordernumberForInventory.contractnumber');
        if(isset($data['dateFrom']) && isset($data['dateTo'])){
            $storageLocation = $storageLocation->where(function($subQuery) use ($data){
                                    $subQuery->wherehas('section', function($section) use ($data){
                                       $section->whereHas('inventoryproduct_sectionto', function($inventoryproduct_sectionto) use ($data){
                                            $from = "'".date( 'Y-m-d'.' 00:00:00', strtotime($data['dateFrom']))."'";
                                            $to = "'".date( 'Y-m-d'.' 23:59:59', strtotime($data['dateTo']))."'";
                                            $inventoryproduct_sectionto->whereBetween('created_at', array($from, $to));
                                        // $inventoryproduct_sectionto->where('created_at', 'like', "'".$data['dateFrom']." %'");
                                        });
                                    });
                                });
        }

        $storageLocation = $storageLocation->where('id', '=', $storageLocationId)->get();
        return $storageLocation->toArray();
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
        
    }
}
