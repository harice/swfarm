<?php

class ReportRepository implements ReportRepositoryInterface {

    /**
     * Generate a Customer Sales Report
     *
     * @param array $params Input
     * @return array
     */
    public function generateSales($params)
    {
        try {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $sortby = isset($params['sortby']) ? $params['sortby'] : 'order.created_at';
            $orderby = isset($params['orderby']) ? $params['orderby'] : 'dsc';

            $report = ProductOrder::leftJoin('products', 'productorder.id', '=', 'products.id')
                ->join('order', 'productorder.order_id', '=', 'order.id')
                ->join('natureofsale', 'order.natureofsale_id', '=', 'natureofsale.id')
                ->join('account', 'order.account_id', '=', 'account.id')
                ->where('order.ordertype', '=', 2);
            
            if (isset($params['dateStart']) && isset($params['dateEnd'])) {
                $report = $report->whereBetween('order.created_at', array($params['dateStart'], $params['dateEnd']));
            }
            
            if (isset($params['accountId'])) {
                $report = $report->where('order.account_id', '=', $params['accountId']);
            }
            
            if (isset($params['search'])) {
                $report = $report->where('name', 'like', '%' . $params['search'] . '%');
            }
            
            $report = $report->select(
                    'productorder.id as id',
                    'productorder.order_id',
                    'productorder.product_id',
                    'productorder.tons as tons',
                    'productorder.bales as bales',
                    'productorder.unitprice as unitprice',
                    'productorder.created_at as created_at',
                    'products.name as product_name',
                    'order.order_number as order_number',
                    'order.account_id as account_id',
                    'order.natureofsale_id as natureofsale_id',
                    'order.created_at as order_created_at',
                    'order.ordertype as order_type',
                    'natureofsale.name as natureofsale_name',
                    'account.name as account_name'
                )
                ->orderBy($sortby, $orderby)
                ->paginate($perPage)
                ->toArray();
            
            $report['summary_total'] = 0.0;
            $report['summary_total_tons'] = 0.0;
            $report['summary_total_bales'] = 0;
            foreach ($report['data'] as $data) {
                $report['summary_total'] += $data['total_price'];
                $report['summary_total_tons'] += $data['tons'];
                $report['summary_total_bales'] += $data['bales'];
            }
            
            return $report;
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }
    
    /**
     * Generate a Producer Statement Report
     * 
     * @param array $params Input
     * @return array
     */
    public function generateProducerStatement($params)
    {
        $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $sortby = isset($params['sortby']) ? $params['sortby'] : 'order.created_at';
        $orderby = isset($params['orderby']) ? $params['orderby'] : 'dsc';
        
        $report = WeightTicketProducts::join('weightticketscale', 'weightticketproducts.weightTicketScale_id', '=', 'weightticketscale.id')
            ->join('transportscheduleproduct', 'weightticketproducts.transportScheduleProduct_id', '=', 'transportscheduleproduct.id')
            ->join('productorder', 'transportscheduleproduct.productorder_id', '=', 'productorder.id')
            ->join('products', 'productorder.product_id', '=', 'products.id')
            ->join('transportschedule', 'transportscheduleproduct.transportschedule_id', '=', 'transportschedule.id')
            ->join('weightticket', 'transportschedule.id', '=', 'weightticket.transportSchedule_id')
            ->join('order', 'transportschedule.order_id', '=', 'order.id');
//            ->join('stack', 'productorder.stacknumber', '=', 'stack.stacknumber')
//            ->leftJoin('stacklocation', 'stack.id', '=', 'stacklocation.stack_id')
//            ->leftJoin('section', 'stacklocation.section_id', '=', 'section.id')
//            ->leftJoin('storagelocation', 'section.storagelocation_id', '=', 'storagelocation.id');
        
        $report = $report
            ->select(
                'weightticketproducts.id as id',
                'weightticketproducts.weightTicketScale_id as weightticketscale_id',
                'weightticketproducts.transportScheduleProduct_id as transportscheduleproduct_id',
                'weightticketproducts.bales as bales',
                'weightticketproducts.pounds as pounds',
                'transportscheduleproduct.transportschedule_id as transportschedule_id',
                'transportscheduleproduct.productorder_id as productorder_id',
                'transportscheduleproduct.sectionto_id as section_id',
                'transportschedule.order_id as order_id',
                'productorder.unitprice as unitprice',
                'products.name as product_name',
                'weightticket.weightTicketNumber as wtn',
                'order.order_number as order_number',
                'order.status_id as order_status_id',
                'order.created_at as created_at'
//                'stack.stacknumber as stack_number',
//                'storagelocation.name as storagelocation_name'
            )
            ->orderBy($sortby, $orderby)
            ->paginate($perPage)
            ->toArray();
        
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
