<?php

/**
 * Description of DashboardRepository
 *
 * @author Avs
 */
class DashboardRepository implements DashboardRepositoryInterface {

    public function dashboard($params){
        if(!isset($params['graphId'])){ //if no graph is specified, return all graphs
            $graph = array(
                    array('graphName' => 'Purchase in tons', 'graphId' => Config::get('constants.GRAPH_PURCHASE_IN_TONS'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->purchaseInTons($params)),
                    array('graphName' => 'Purchase in dollar values', 'graphId' => Config::get('constants.GRAPH_PURCHASE_IN_DOLLAR_VALUES'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->purchaseInDollarValues($params)),
                    array('graphName' => 'Sales in tons', 'graphId' => Config::get('constants.GRAPH_SALES_IN_TONS'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->salesInTons($params)),
                    array('graphName' => 'Sales in dollar values', 'graphId' => Config::get('constants.GRAPH_SALES_IN_DOLLAR_VALUES'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->salesInDollarValues($params))
                );
        } else {
            switch ($params['graphId']) {
                case Config::get('constants.GRAPH_PURCHASE_IN_TONS'):
                    $graph = $this->purchaseInTons($params);
                    break;
                case Config::get('constants.GRAPH_PURCHASE_IN_DOLLAR_VALUES'):
                    $graph = $this->purchaseInDollarValues($params);
                    break;
                case Config::get('constants.GRAPH_SALES_IN_TONS'):
                    $graph = $this->salesInTons($params);
                    break;
                case Config::get('constants.GRAPH_SALES_IN_DOLLAR_VALUES'):
                    $graph = $this->salesInDollarValues($params);
                    break;
                default:
                    # code...
                    break;
            }
        }

        return $graph;

    }
    
    public function purchaseInTons($params){
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d 00:00:00', strtotime("yesterday"));
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d 23:59:59', strtotime("yesterday"));

        $products = Product::with(array('productordertons'=> function($query) use ($dateFrom, $dateTo){
                                $query->whereHas('order', function($query) use ($dateFrom, $dateTo){
                                    $query->whereBetween('created_at', array($dateFrom, $dateTo))
                                          ->where('orderType', '=', Config::get('constants.ORDERTYPE_PO'))
                                          ->where(function($query){
                                                $status = array(Config::get('constants.STATUS_OPEN'), Config::get('constants.STATUS_TESTING'), Config::get('constants.STATUS_CLOSED'));
                                                $query->whereIn('status_id', $status);
                                          });
                                });
                            }))->orderby('name', 'asc')->get(array('id', 'name'))->toArray();

        $data = array();
        // return $products;
        if(count($products)){
            $index = 0;
            foreach($products as $item){
                if(count($item['productordertons']) == 0){
                    continue;
                }
                $data[$index]['product'] = $item['name'];
                $data[$index]['totalTons'] = 0;
                foreach($item['productordertons'] as $productOrder){
                    $data[$index]['totalTons'] += $productOrder['tons'];
                }
                $index++;
            }
        }

        return $data;
    }

    public function purchaseInDollarValues($params){
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d 00:00:00', strtotime("yesterday"));
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d 23:59:59', strtotime("yesterday"));

         $products = Product::with(array('productordertons'=> function($query) use ($dateFrom, $dateTo){
                                $query->whereHas('order', function($query) use ($dateFrom, $dateTo){
                                    $query->whereBetween('created_at', array($dateFrom, $dateTo))
                                          ->where('orderType', '=', Config::get('constants.ORDERTYPE_PO'))
                                          ->where(function($query){
                                                $status = array(Config::get('constants.STATUS_OPEN'), Config::get('constants.STATUS_TESTING'), Config::get('constants.STATUS_CLOSED'));
                                                $query->whereIn('status_id', $status);
                                          });
                                });
                            }))
                            ->orderby('name', 'asc')->get(array('id', 'name'))->toArray();

        $data = array();
        // return $products;
        if(count($products)){
            $index = 0;
            foreach($products as $item){
                if(count($item['productordertons']) == 0){
                    continue;
                }
                $data[$index]['product'] = $item['name'];
                $data[$index]['dollarValues'] = 0.0;
                foreach($item['productordertons'] as $productOrder){
                    $data[$index]['dollarValues'] += $productOrder['tons'] * $productOrder['unitprice'];
                }
                $data[$index]['dollarValues'] = number_format($data[$index]['dollarValues'], 2, '.', '');
                $index++;
            }
        }

        return $data;
    }

    public function salesInTons($params){
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d 00:00:00', strtotime("yesterday"));
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d 23:59:59', strtotime("yesterday"));

        $products = Product::with(array('productordertons'=> function($query) use ($dateFrom, $dateTo){
                                $query->whereHas('order', function($query) use ($dateFrom, $dateTo){
                                    $query->whereBetween('created_at', array($dateFrom, $dateTo))
                                          ->where('orderType', '=', Config::get('constants.ORDERTYPE_SO'))
                                          ->where(function($query){
                                                $status = array(Config::get('constants.STATUS_OPEN'), Config::get('constants.STATUS_TESTING'), Config::get('constants.STATUS_CLOSED'));
                                                $query->whereIn('status_id', $status);
                                          });
                                });
                            }))->orderby('name', 'asc')->get(array('id', 'name'))->toArray();

        $data = array();
        // return $products;
        if(count($products)){
            $index = 0;
            foreach($products as $item){
                if(count($item['productordertons']) == 0){
                    continue;
                }
                $data[$index]['product'] = $item['name'];
                $data[$index]['totalTons'] = 0;
                foreach($item['productordertons'] as $productOrder){
                    $data[$index]['totalTons'] += $productOrder['tons'];
                }
                $index++;
            }
        }

        return $data;
    }

    public function salesInDollarValues($params){
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d 00:00:00', strtotime("yesterday"));
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d 23:59:59', strtotime("yesterday"));

         $products = Product::with(array('productordertons'=> function($query) use ($dateFrom, $dateTo){
                                $query->whereHas('order', function($query) use ($dateFrom, $dateTo){
                                    $query->whereBetween('created_at', array($dateFrom, $dateTo))
                                          ->where('orderType', '=', Config::get('constants.ORDERTYPE_SO'))
                                          ->where(function($query){
                                                $status = array(Config::get('constants.STATUS_OPEN'), Config::get('constants.STATUS_TESTING'), Config::get('constants.STATUS_CLOSED'));
                                                $query->whereIn('status_id', $status);
                                          });
                                });
                            }))
                            ->orderby('name', 'asc')->get(array('id', 'name'))->toArray();

        $data = array();
        // return $products;
        if(count($products)){
            $index = 0;
            foreach($products as $item){
                if(count($item['productordertons']) == 0){
                    continue;
                }
                $data[$index]['product'] = $item['name'];
                $data[$index]['dollarValues'] = 0.0;
                foreach($item['productordertons'] as $productOrder){
                    $data[$index]['dollarValues'] += $productOrder['tons'] * $productOrder['unitprice'];
                }
                $data[$index]['dollarValues'] = number_format($data[$index]['dollarValues'], 2, '.', '');
                $index++;
            }
        }

        return $data;
    }
    
}
