<?php

class ReportRepository implements ReportRepositoryInterface {

    /**
     * Generate a Customer Sales Report
     *
     * @param mixed $params Input
     * @return Collection
     */
    public function getSales($params)
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
            
            $result = $report->select(
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
            
            $result['summary_total'] = 0.0;
            $result['summary_total_tons'] = 0.0;
            $result['summary_total_bales'] = 0;
            foreach ($result['data'] as $data) {
                $result['summary_total'] += $data['total_price'];
                $result['summary_total_tons'] += $data['tons'];
                $result['summary_total_bales'] += $data['bales'];
            }
            
            return $result;
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }
}
