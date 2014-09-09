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
                    array('graphName' => 'Purchase in tons', 'graphId' => Config::get('constants.GRAPH_PURCHASE_IN_TONS'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->purchaseInTons($params), 'filters' => array('date')),
                    array('graphName' => 'Purchase in dollar values', 'graphId' => Config::get('constants.GRAPH_PURCHASE_IN_DOLLAR_VALUES'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->purchaseInDollarValues($params), 'filters' => array('date')),
                    array('graphName' => 'Sales in tons', 'graphId' => Config::get('constants.GRAPH_SALES_IN_TONS'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->salesInTons($params), 'filters' => array('date')),
                    array('graphName' => 'Sales in dollar values', 'graphId' => Config::get('constants.GRAPH_SALES_IN_DOLLAR_VALUES'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->salesInDollarValues($params), 'filters' => array('date'))
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
                $data[$index]['label'] = $item['name'];
                $data[$index]['value'] = 0;
                foreach($item['productordertons'] as $productOrder){
                    $data[$index]['value'] += $productOrder['tons'];
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
                $data[$index]['label'] = $item['name'];
                $data[$index]['value'] = 0.0;
                foreach($item['productordertons'] as $productOrder){
                    $data[$index]['value'] += $productOrder['tons'] * $productOrder['unitprice'];
                }
                $data[$index]['value'] = number_format($data[$index]['value'], 2, '.', '');
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
                $data[$index]['label'] = $item['name'];
                $data[$index]['value'] = 0;
                foreach($item['productordertons'] as $productOrder){
                    $data[$index]['value'] += $productOrder['tons'];
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
                $data[$index]['label'] = $item['name'];
                $data[$index]['value'] = 0.0;
                foreach($item['productordertons'] as $productOrder){
                    $data[$index]['value'] += $productOrder['tons'] * $productOrder['unitprice'];
                }
                $data[$index]['value'] = number_format($data[$index]['value'], 2, '.', '');
                $index++;
            }
        }

        return $data;
    }

    public function reservedDeliveredVsBalanceOrderPerCustomerAccount($params){
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d 00:00:00', strtotime("yesterday"));
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d 23:59:59', strtotime("yesterday"));

        $result = Account::with(array(
                            'order.productorder' => function($query){
                                $query->addSelect(array('id', 'order_id', 'tons'));
                             }
                             ,
                            'order.productorder.transportscheduleproduct.transportschedule' => function($query){
                                $query->addSelect(array('id', 'order_id'));
                            },
                            'order.productorder.transportscheduleproduct.transportschedule.weightticket' => function($query){
                                $query->addSelect(array('id', 'transportSchedule_id', 'pickup_id', 'dropoff_id', 'status_id', 'weightTicketNumber'));
                            },
                            'order.productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_pickup' => function($query){
                                $query->addSelect(array('id', 'gross', 'tare'));
                            },
                            'order.productorder.transportscheduleproduct.transportschedule.weightticket.weightticketscale_dropoff' => function($query){
                                $query->addSelect(array('id', 'gross', 'tare'));
                            }
                            ))
                         ->with(array('order' => function($query) use ($dateFrom, $dateTo) {
                            $query->where('natureofsale_id', '=', Config::get('constants.NATUREOFSALES_RESERVATION'))
                                  ->whereBetween('created_at', array($dateFrom, $dateTo))
                                  ->where('orderType', '=', Config::get('constants.ORDERTYPE_SO'))
                                  ->where(function($query){
                                        $status = array(Config::get('constants.STATUS_OPEN'), Config::get('constants.STATUS_TESTING'), Config::get('constants.STATUS_CLOSED'));
                                        $query->whereIn('status_id', $status);
                                  });
                         }))
                         ->whereHas('accounttype', function($query){
                                $query->where('accounttype.id', '=', 1);
                         })
                         ->orderby('name', 'asc')
                         ->get(array('id', 'name'))
                         ->toArray();

        return $result;
    }
    
}
