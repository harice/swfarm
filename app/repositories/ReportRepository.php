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

                // Filter by Date
                if (isset($params['dateStart']))
                {
                    $q->where('weightticketproducts.created_at', '>', $params['dateStart']);
                }

                if (isset($params['dateEnd']))
                {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '<', $date_end);
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

                // Filter by Date
                if (isset($params['dateStart']))
                {
                    $q->where('weightticketproducts.created_at', '>', $params['dateStart']);
                }

                if (isset($params['dateEnd']))
                {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '<', $date_end);
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
            'order.order_number',
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
        $contact_origin = Contact::with('loadOrigin.order.account');

        $contact_origin = $contact_origin->whereHas('loadOrigin',
            function($q) use ($id, $params) {
                $q->where('trucker_id', '=', $id);
            });

        $contact_origin = $contact_origin->get();
        if (!$contact_origin) {
            throw new Exception('Contact not found.');
        }

        $contact_origin = $contact_origin->toArray();

        // Get load destination
        $contact_destination = Contact::with('loadDestination.order.account');
        $contact_destination = $contact_destination->whereHas('loadOrigin',
            function($q) use ($id, $params) {
                $q->where('trucker_id', '=', $id);
            });

        $contact_destination = $contact_destination->get();
        if (!$contact_destination) {
            throw new Exception('Contact not found.');
        }

        $contact_destination = $contact_destination->toArray();

        // Contruct transactions
        $loads = array();
        $i = 0;
        $total = 0.00;
        foreach ($contact_origin as $contact)
        {
            foreach ($contact['load_origin'] as $load) {
                $item['id'] = $i;
                $item['type'] = 'Load';
                $item['amount'] = $load['originloaderfee'];
                $item['account_name'] = $load['order']['account']['name'];
                $item['loader'] = $contact['lastname'] . ', ' .$contact['firstname'];
                $item['created_at'] = date('Y-m-d', strtotime($load['created_at']));

                $loads[] = $item;
                $total += $item['amount'];
                $i++;
            }
        }

        foreach ($contact_destination as $contact)
        {
            foreach ($contact['load_destination'] as $load) {
                $item['id'] = $i;
                $item['type'] = 'Unload';
                $item['amount'] = $load['destinationloaderfee'];
                $item['account_name'] = $load['order']['account']['name'];
                $item['loader'] = $contact['lastname'] . ', ' .$contact['firstname'];
                $item['created_at'] = date('Y-m-d', strtotime($load['created_at']));

                $loads[] = $item;
                $total += $item['amount'];
                $i++;
            }
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

                // Filter by Date
                if (isset($params['dateStart']))
                {
                    $q->where('weightticketproducts.created_at', '>', $params['dateStart']);
                }

                if (isset($params['dateEnd']))
                {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '<', $date_end);
                }
            })
            ->join('productorder', 'productorder_id', '=', 'productorder.id')
            ->join('order', 'transportschedule.order_id', '=', 'order.id');

        $transactions = $transactions->leftJoin('section as section_origin', 'productorder.section_id', '=','section_origin.id')
            ->leftJoin('section as section_destination', 'transportscheduleproduct.sectionto_id', '=', 'section_destination.id')
            ->join('storagelocation as storagelocation_origin', 'section_origin.storagelocation_id', '=', 'storagelocation_origin.id')
            ->leftJoin('storagelocation as storagelocation_destination', 'section_destination.storagelocation_id', '=', 'storagelocation_destination.id');

        $transactions = $transactions->join('contact as loader_origin', 'transportschedule.originloader_id', '=', 'loader_origin.id')
            ->join('contact as loader_destination', 'transportschedule.destinationloader_id', '=', 'loader_destination.id');

        $transactions = $transactions->join('weightticketscale', 'weightticketproducts.weightTicketScale_id', '=', 'weightticketscale.id');
        $transactions = $transactions->leftJoin('weightticket as pickup_wt', 'weightticketscale.id', '=', 'pickup_wt.pickup_id');
        $transactions = $transactions->leftJoin('weightticket as dropoff_wt', 'weightticketscale.id', '=', 'dropoff_wt.dropoff_id');

        $transactions = $transactions->where('truck.id', '=', $id);

        $transactions = $transactions->select(
            'weightticketproducts.id as id',
            'weightticketproducts.bales',
            'weightticketproducts.pounds',
            'order.order_number',
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

            'pickup_wt.loadingTicketNumber as loading_ticket_number',
            'dropoff_wt.unloadingTicketNumber as unloading_ticket_number',
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

        $truck_loads = array();
        foreach($transactions->toArray() as $truck_load)
        {
            $truck_loads[] = array(
                'order_number' => $truck_load['order_number'],
                'receipt_no' => ($truck_load['loading_type'] == 2) ? $truck_load['unloading_ticket_number'] : $truck_load['loading_ticket_number'],
                'type' => ($truck_load['loading_type'] == 2) ? 'Unload' : 'Load',
                'loader' => ($truck_load['loading_type'] == 2) ? $truck_load['loader_destination_lastname'] .', ' .$truck_load['loader_destination_firstname'] : $truck_load['loader_origin_lastname'] .', ' .$truck_load['loader_origin_firstname'],
                'amount' => ($truck_load['loading_type'] == 2) ? $truck_load['loader_destination_fee'] : $truck_load['loader_origin_fee'],
            );
        }


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
        $report['truck_loads'] = $truck_loads;

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

                // Filter by Date
                if (isset($params['dateStart']))
                {
                    $q->where('weightticketproducts.created_at', '>', $params['dateStart']);
                }

                if (isset($params['dateEnd']))
                {
                    $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
                    $q->where('weightticketproducts.created_at', '<', $date_end);
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

    /**
     * Generate Gross Profit Report
     *
     * @param array $params
     * @return mixed
     */
    public function generateGrossProfit($params)
    {
        $weighttickets = WeightTicket::with(
            'transportschedule.order.account',
            'weightticketscale_pickup.weightticketproducts.transportscheduleproduct.productorder',
            'weightticketscale_dropoff.weightticketproducts.transportscheduleproduct.productorder'
        );

        // Filter by Date
        if (isset($params['dateStart']))
        {
            $weighttickets = $weighttickets->where('created_at', '>', $params['dateStart']);
        }

        if (isset($params['dateEnd']))
        {
            $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
            $weighttickets = $weighttickets->where('created_at', '<', $date_end);
        }

        $weighttickets = $weighttickets->get();

        $transactions = array();
        foreach ($weighttickets as $weightticket)
        {
            $pounds = 1.0;
            $tons = 1.0;
            $unitprice = 1.0;
            $buying_price = 1.0;
            $total_sales = 1.0;

            if ($weightticket['weightticketscale_pickup'])
            {
                $weightticket_products = $weightticket['weightticketscale_pickup']->weightticketproducts->toArray();

                foreach ($weightticket_products as $weightticket_product)
                {
                    $pounds += $weightticket_product['pounds'];
                    $tons += $weightticket_product['tons'];
                    $unitprice += $weightticket_product['transportscheduleproduct']['productorder']['unitprice'];

                    $stacknumber = $weightticket_product['transportscheduleproduct']['productorder']['stacknumber'];
                    $productorder_id = $weightticket_product['transportscheduleproduct']['productorder']['id'];
                    $buying_price += $this->getBuyingPrice($stacknumber, $productorder_id);
                }
                $total_sales = ($pounds * 0.0005) * $unitprice;
            }
            else
            {
                $weightticket_products = $weightticket['weightticketscale_dropoff']->weightticketproducts->toArray();

                foreach ($weightticket_products as $weightticket_product)
                {
                    $pounds += $weightticket_product['pounds'];
                    $tons += $weightticket_product['tons'];
                    $unitprice += $weightticket_product['transportscheduleproduct']['productorder']['unitprice'];
                }
                $total_sales = ($pounds * 0.0005) * $unitprice;
            }

            $updated_at = $weightticket['updated_at'];
            $account = $weightticket['transportschedule']['order']['account']['name'];
            $net_sale = $total_sales - 0.0; // Total Sales - Return Sales
            $hay_cost = $tons * $buying_price;
            $freight = $weightticket['transportschedule']['truckingrate'] + $weightticket['transportschedule']['trailerrate'] + $weightticket['transportschedule']['fuelcharge'];
            $fees = $weightticket['transportschedule']['originloaderfee'] + $weightticket['transportschedule']['destinationloaderfee'];
            $commission = $this->getCommission($weightticket['id']);
            $profit_amount = $net_sale - $hay_cost - $freight - $fees - $commission;
            $profit_percentage = number_format((($profit_amount / $net_sale) * 100), 2, '.', ',');

            $transactions[] = array(
                'updated_at' => $updated_at,
                'account' => $account,
                'net_sale' => $net_sale,
                'total_tons' => $tons,
                'hay_cost' => $hay_cost,
                'freight_cost' => $freight,
                'fees' => $fees,
                'commission' => $commission,
                'profit_amount' => $profit_amount,
                'profit_percentage' => $profit_percentage
            );
        }

        // Construct summary
        $total_cost = $total_hay_cost = $total_freight_cost = $total_profit_amount = $total_net_sale = $total_profit_percentage = 0.0;
        foreach ($transactions as $transaction)
        {
            $total_hay_cost += $transaction['hay_cost'];
            $total_freight_cost += $transaction['freight_cost'];
            $total_profit_amount += $transaction['profit_amount'];
            $total_net_sale += $transaction['net_sale'];
        }
        $total_cost = $total_hay_cost + $total_freight_cost;
        $total_profit_percentage = number_format((($total_profit_amount / $total_net_sale) * 100), 2, '.', ',');

        $report['summary']['total_transactions'] = $weighttickets->count();
        $report['summary']['total_cost'] = $total_cost;
        $report['summary']['total_hay_cost'] = $total_hay_cost;
        $report['summary']['total_freight_cost'] = $total_freight_cost;
        $report['summary']['total_profit_amount'] = $total_profit_amount;
        $report['summary']['total_profit_percentage'] = $total_profit_percentage;
        $report['data'] = $weighttickets->toArray();
        $report['transactions'] = $transactions;

        return $report;
    }

    /**
     * Get unitprice by stacknumber
     *
     * @param string $stacknumber
     * @param int $id Product Order ID
     * @return float
     */
    public function getBuyingPrice($stacknumber, $id)
    {
        $productorder = ProductOrder::where('stacknumber', 'like', $stacknumber)
            ->where('id', '!=', $id)
            ->first();

        if ($productorder) {
            $productorder = $productorder->toArray();
            return $productorder['unitprice'];
        }

        return 0.0;
    }

    /**
     * Get commission by weight ticket id.
     *
     * @param int $weightticket_id Weight Ticket Id
     * @return float
     */
    public function getCommission($weightticket_id)
    {
        $commission = Commission::where('weightticket_id', '=', $weightticket_id)->first();

        if ($commission)
        {
            return $commission['amountdue'];
        }

        return 0.0;
    }

    public function inventoryReportPerLocation($data){
        $perPage = isset($data['perpage']) ? $data['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $storageLocationId = $data['storagelocationId'];
        // var_dump(date( 'Y-m-d'. ' 00:00:00', strtotime($data['dateFrom'])));
        // var_dump(date( 'Y-m-d'.' 23:59:59', strtotime($data['dateTo'])));
        // var_dump(date('Y-m-d', strtotime($data['dateFrom'])));
        $storageLocation = StorageLocation::with('section.inventoryproduct_sectionto.inventory.inventorytransactiontype')
                                        ->with('section.inventoryproduct_sectionto.inventory.ordernumberforinventory.account')
                                        ->with('section.inventoryproduct_sectionto.inventory.weightticketnumber')
                                        ->with('section.inventoryproduct_sectionfrom.inventory.inventorytransactiontype')
                                        ->with('section.inventoryproduct_sectionfrom.inventory.ordernumberforinventory.account')
                                        ->with('section.inventoryproduct_sectionfrom.inventory.weightticketnumber');

        if(isset($data['dateFrom']) && isset($data['dateTo'])){
                $storageLocation->with(array('section.inventoryproduct_sectionto' => function ($query) use ($data){
                        $from = date('Y-m-d'. ' 00:00:00', strtotime($data['dateFrom']));
                        $to = date('Y-m-d'. ' 23:59:59', strtotime($data['dateTo']));
                        $query->whereBetween('created_at', array($from, $to));
                }));
                $storageLocation->with(array('section.inventoryproduct_sectionfrom' => function ($query) use ($data){
                        $from = date('Y-m-d'. ' 00:00:00', strtotime($data['dateFrom']));
                        $to = date('Y-m-d'. ' 23:59:59', strtotime($data['dateTo']));
                        $query->whereBetween('created_at', array($from, $to));
                }));
        }

        $storageLocation = $storageLocation->where('id', '=', $storageLocationId)->first();
        // exit;
        // return $storageLocation->toArray();
        if($storageLocation){
            $result = $storageLocation->toArray();
            $data = array();
            $index = 0;
            $data['location'] = $result['name'];
            $data['balesIn'] = 0;
            $data['balesOut'] = 0;
            $data['tonsIn'] = 0;
            $data['tonsOut'] = 0;
            $data['totalBales'] = 0;
            $data['totalBales'] = 0;
            $data['totalTons'] = 0;
            $data['totalCost'] = 0;
            foreach($result['section'] as $section){
                foreach($section['inventoryproduct_sectionto'] as $inventoryproduct){
                    $data['data'][$index]['section'] = $section['name'];
                    $data['data'][$index]['date'] = $inventoryproduct['inventory']['created_at'];
                    $data['data'][$index]['ordernumber'] = $inventoryproduct['inventory']['ordernumberforinventory']['order_number'] != null ? $inventoryproduct['inventory']['ordernumberforinventory']['order_number'] : "";
                    $data['data'][$index]['weightticketnumber'] = $inventoryproduct['inventory']['weightticketnumber']['weightTicketNumber'] != null ? $inventoryproduct['inventory']['weightticketnumber']['weightTicketNumber'] : "";
                    $data['data'][$index]['producer'] = $inventoryproduct['inventory']['ordernumberforinventory']['order_number'] != null ? $inventoryproduct['inventory']['ordernumberforinventory']['account']['name'] : "";
                    $data['data'][$index]['contract'] = isset($inventoryproduct['inventory']['ordernumberforinventory']['contract']) ? $inventoryproduct['inventory']['ordernumberforinventory']['contract']['contract_number'] : "";
                    $data['data'][$index]['bales'] = $inventoryproduct['bales'] != null ? $inventoryproduct['bales'] : "0";
                    $data['data'][$index]['tons'] = $inventoryproduct['tons'];
                    $data['data'][$index]['price'] = $inventoryproduct['price'];
                    $data['data'][$index]['cost'] = $inventoryproduct['tons'] * $inventoryproduct['price'];
                    $data['data'][$index]['operation'] = $inventoryproduct['inventory']['inventorytransactiontype']['type'];
                    $data['balesIn'] += $data['data'][$index]['bales'];
                    $data['tonsIn'] += $data['data'][$index]['tons'];
                    $data['totalBales'] += $data['data'][$index]['bales'];
                    $data['totalTons'] += $data['data'][$index]['tons'];
                    $data['totalCost'] += $data['data'][$index]['cost'];
                    $data['data'][$index]['cost'] = number_format($data['data'][$index]['cost'], 2);
                    $index++;
                }
                foreach($section['inventoryproduct_sectionfrom'] as $inventoryproduct){
                    $data['data'][$index]['section'] = $section['name'];
                    $data['data'][$index]['date'] = $inventoryproduct['inventory']['created_at'];
                    $data['data'][$index]['ordernumber'] = $inventoryproduct['inventory']['ordernumberforinventory']['order_number'] != null ? $inventoryproduct['inventory']['ordernumberforinventory']['order_number'] : "";
                    $data['data'][$index]['weightticketnumber'] = $inventoryproduct['inventory']['weightticketnumber']['weightTicketNumber'] != null ? $inventoryproduct['inventory']['weightticketnumber']['weightTicketNumber'] : "";
                    $data['data'][$index]['producer'] = $inventoryproduct['inventory']['ordernumberforinventory']['order_number'] != null ? $inventoryproduct['inventory']['ordernumberforinventory']['account']['name'] : "";
                    $data['data'][$index]['contract'] = isset($inventoryproduct['inventory']['ordernumberforinventory']['contract']) ? $inventoryproduct['inventory']['ordernumberforinventory']['contract']['contract_number'] : "";
                    $data['data'][$index]['bales'] = $inventoryproduct['bales'] != null ? $inventoryproduct['bales'] : "0";
                    $data['data'][$index]['tons'] = $inventoryproduct['tons'];
                    $data['data'][$index]['price'] = $inventoryproduct['price'];
                    $data['data'][$index]['cost'] = $inventoryproduct['tons'] * $inventoryproduct['price'];
                    $data['data'][$index]['operation'] = $inventoryproduct['inventory']['inventorytransactiontype']['type'];
                    $data['balesOut'] += $data['data'][$index]['bales'];
                    $data['tonsOut'] += $data['data'][$index]['tons'];
                    $data['totalBales'] += $data['data'][$index]['bales'];
                    $data['totalTons'] += $data['data'][$index]['tons'];
                    $data['totalCost'] += $data['data'][$index]['cost'];
                    $data['data'][$index]['cost'] = number_format($data['data'][$index]['cost'], 2);
                    $index++;
                }

            }
            $data['tonsIn'] = number_format($data['tonsIn'], 0, '.', '');
            $data['tonsOut'] = number_format($data['tonsOut'], 0, '.', '');
            $data['balesIn'] = number_format($data['balesIn'], 0, '.', '');
            $data['balesOut'] = number_format($data['balesOut'], 0, '.', '');
            $data['totalBales'] = number_format($data['totalBales'], 0, '.', '');
            $data['totalTons'] = number_format($data['totalTons'], 2, '.', '');
            $data['totalCost'] = number_format($data['totalCost'], 2, '.', '');
            return $data;
        } else {
            return array('error' => true, 'message' => 'No record found.');
        }

    }

    /**
     * Generate Commission Report
     *
     * @param int $id User ID
     * @param array $params
     * @return mixed
     */
    public function generateCommissionReport($id, $params)
    {
        $transactions = Commission::join('weightticket', 'weightticket_id', '=', 'weightticket.id')
            ->join('order', function($o)
            {
                $o->on('commission.order_id', '=', 'order.id');
            })
            ->join('users', 'commission.user_id', '=', 'users.id')
            ->join('account', 'order.account_id', '=', 'account.id');

        $transactions = $transactions->join('weightticketscale as pickup', 'weightticket.pickup_id', '=', 'pickup.id');

        $transactions = $transactions->join('weightticketscale as dropoff', 'weightticket.dropoff_id', '=', 'dropoff.id');

        $transactions = $transactions->where('commission.user_id', '=', $id);

        // Filter by Date
        if (isset($params['dateStart']))
        {
            $transactions = $transactions->where('weightticket.created_at', '>', $params['dateStart']);
        }

        if (isset($params['dateEnd']))
        {
            $date_end = date('Y-m-d', strtotime("+1 day", strtotime($params['dateEnd'])));
            $transactions = $transactions->where('weightticket.created_at', '<', $date_end);
        }

        $transactions -> select(
            'weightticket.created_at',
            'account.name as account_name',
            'commission.rate',
            'pickup.bales',
            'pickup.gross',
            'pickup.tare',
            'commission.amountdue',
            'commission.type'
        );

        $total_bales = $transactions->sum('pickup.bales');
        $total_pounds = $transactions->sum('pickup.gross') - $transactions->sum('pickup.tare');
        $total_commissions = $transactions->sum('commission.amountdue');
        $transactions = $transactions->get();

        $report['user'] = User::find($id)->toArray();
        $report['summary']['total_transactions'] = $transactions->count();
        $report['summary']['total_bales'] = $total_bales;
        $report['summary']['total_tons'] = $total_pounds;
        $report['summary']['total_commissions'] = $total_commissions;
        $report['transactions'] = $transactions->toArray();

        return $report;
    }

}
