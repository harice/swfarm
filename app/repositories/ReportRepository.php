<?php

use \StorageLocationRepositoryInterface;

class ReportRepository implements ReportRepositoryInterface {
    
    public function __construct(StorageLocationRepositoryInterface $storagelocation)
    {
        $this->storagelocation = $storagelocation;
    }

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
        $sortby = isset($params['sortby']) ? $params['sortby'] : 'productorder.created_at';
        $orderby = isset($params['orderby']) ? $params['orderby'] : 'dsc';
        
        $statement = array();
        $statements = array();
        
        $productorder = ProductOrder::with(
                'order.account',
                'transportscheduleproduct.weightticketproducts',
                'transportscheduleproduct.transportschedule.weightticket'
            )
            ->join('products', 'productorder.product_id', '=', 'products.id')
            ->join('section', 'section.id', '=', 'productorder.section_id')
            ->join('storagelocation', 'section.storagelocation_id', '=', 'storagelocation.id');
        
        if (isset($params['accountId'])) {
            $productorder = $productorder->whereHas('order', function($q) use ($params)
            {
                $q->where('account_id', '=', $params['accountId']);
            });
        }
        
        $productorder = $productorder->whereHas('transportscheduleproduct', function($q)
        {
            $q->with('weightticketproducts');
            $q->whereHas('weightticketproducts', function($r)
            {
                $r->with('product');
            });
        });
        
        if (isset($params['dateStart']) && isset($params['dateEnd'])) {
            $productorder = $productorder->whereBetween('productorder.created_at', array($params['dateStart'], $params['dateEnd']));
        }
        
        $productorder = $productorder->select(
            'productorder.id as id',
            'productorder.order_id as order_id',
            'productorder.unitprice as price',
            'productorder.created_at as created_at',
            'section.storagelocation_id as storagelocation_id',
            'storagelocation.name as storagelocation_name'
        );
        
        $productorders = $productorder->get()->toArray();
        
        foreach ($productorders as &$productorder) {
            foreach ($productorder['transportscheduleproduct'] as $transportscheduleproduct) {
                if ($transportscheduleproduct['weightticketproducts']) {
                    $statement = array(
                        'storagelocation_name' => $productorder['storagelocation_name'],
                        'date' => $productorder['order']['created_at'],
                        'order_number' => $productorder['order']['order_number'],
                        'weightticket_number' => $transportscheduleproduct['transportschedule']['weightticket']['weightTicketNumber'],
                        'bales' => $transportscheduleproduct['weightticketproducts'][0]['bales'],
                        'tons' => $transportscheduleproduct['weightticketproducts'][0]['pounds'] * 0.0005,
                        'price' => $productorder['price'],
                        'amount' => $transportscheduleproduct['weightticketproducts'][0]['pounds'] * 0.0005 * $productorder['price']
                    );
                    
                    $statements[] = $statement;
                }
            }
        }
        
        if (isset($params['accountId'])) {
            $report['account'] = Account::with('address')->find($params['accountId'])->toArray();
        }
        $report['statements'] = $statements;
//        $report['productorders'] = $productorders;
        
        return $report;
    }
    
    /**
     * Get Storage Location Name
     * 
     * @param int $account_id
     * @return string
     */
    public function getLocationName($account_id, $stack_id)
    {
        $stacklocation = StackLocation::where('stack_id', '=', $stack_id)->first();
        Log::debug($stacklocation);
        
        $params = array(
            'accountId' => 21
        );
        $storagelocations = $this->storagelocation->findAll($params)->toArray();
        
        foreach ($storagelocations['data'] as $storagelocation) {
            foreach ($storagelocation['section'] as $section) {
                
            }
        }
        
        return 'Location Name';
    }
}
