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
                    array('graphName' => 'Sales in dollar values', 'graphId' => Config::get('constants.GRAPH_SALES_IN_DOLLAR_VALUES'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->salesInDollarValues($params), 'filters' => array('date')),
                    array('graphName' => 'Reserve Customers', 'graphId' => Config::get('constants.GRAPH_CUSTOMER_ORDER_VS_DELIVERED'), 'graphType' => Config::get('constants.GRAPH_TYPE_2'), 'data' => $this->reservedDeliveredVsBalanceOrderPerCustomerAccount($params), 'filters' => array('date'))
                );
        } else {
            $graph['graphId'] = $params['graphId'];
            switch ($params['graphId']) {
                case Config::get('constants.GRAPH_PURCHASE_IN_TONS'):
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_1');
                    $graph['data'] = $this->purchaseInTons($params);
                    break;
                case Config::get('constants.GRAPH_PURCHASE_IN_DOLLAR_VALUES'):
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_1');
                    $graph['data'] = $this->purchaseInDollarValues($params);
                    break;
                case Config::get('constants.GRAPH_SALES_IN_TONS'):
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_1');
                    $graph['data'] = $this->salesInTons($params);
                    break;
                case Config::get('constants.GRAPH_SALES_IN_DOLLAR_VALUES'):
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_1');
                    $graph['data'] = $this->salesInDollarValues($params);
                    break;
                case Config::get('constants.GRAPH_CUSTOMER_ORDER_VS_DELIVERED'):
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_2');
                    $graph['data'] = $this->reservedDeliveredVsBalanceOrderPerCustomerAccount($params);
                    break;
                case Config::get('constants.GRAPH_INVENTORY_PRODUCT_ON_HAND'):
                    $graph['data'] = $this->inventoryProductOnHand($params);
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
        $data = array();
        $index = 0;
        foreach($result as $item){
            $data[$index]['id'] = $item['id'];
            $data[$index]['name'] = $item['name'];
            $data[$index]['totalTonsOrdered'] = 0;
            $data[$index]['totalTonsDelivered'] = 0;
            foreach($item['order'] as $order){
                $transportschedule = TransportSchedule::with('weightticket.weightticketscale_pickup')
                                                      ->with('weightticket.weightticketscale_dropoff')
                                                      ->with(array('weightticket' => function($query){
                                                            $query->where('status_id', '=', Config::get('constants.STATUS_CLOSED'));
                                                      }))
                                                      ->where('order_id', '=', $order['id'])
                                                      ->get()
                                                      ->toArray();
                foreach($transportschedule as $schedule){
                    if($schedule['weightticket']['pickup_id'] != null){
                        $weightticketscale = $schedule['weightticket']['weightticketscale_pickup'];
                    } else if($schedule['weightticket']['dropoff_id'] != null){
                        $weightticketscale = $schedule['weightticket']['weightticketscale_dropoff'];
                    } else {
                        $weightticketscale = null;
                    }
                    if($weightticketscale != null){
                        $data[$index]['totalTonsDelivered'] += $weightticketscale['gross'] - $weightticketscale['tare'];
                    }
                }
                
                foreach($order['productorder'] as $productorder){
                    $data[$index]['totalTonsOrdered'] += $productorder['tons'];
                }
            }
            $data[$index]['totalTonsDelivered'] = number_format($data[$index]['totalTonsDelivered'], 2);
            $data[$index]['totalTonsOrdered'] = number_format($data[$index]['totalTonsOrdered'], 2);
            $index++;
        }
        
        return $data;
    }

    public function inventoryProductOnHand($params){
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d 00:00:00', strtotime("today"));
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d 23:59:59', strtotime("today"));

        $products = Product::with('stack.stacklocation')->orderby('name', 'asc')->get()->toArray();
        // return $products;
        $temp =  array();
        foreach($products as $product){
            $result = Product::with(array('productorder.transportscheduleproduct.transportschedule.order' => function($query){
                                    $query->addSelect(array('id', 'ordertype'));
                                }))
                                ->with(array('productorder.transportscheduleproduct.transportschedule' => function($query) use ($dateFrom, $dateTo){
                                    $query->addSelect(array('id', 'order_id', 'date'))
                                          ->whereBetween('date', array($dateFrom, $dateTo));
                                          // ->whereHas('order', function($query){
                                          //       $query->where('ordertype', '=', Config::get('constants.ORDERTYPE_PO'));
                                          // });
                                }))
                                // ->wherehas('productorder', function($query){
                                //     $query->whereHas('transportscheduleproduct', function($query){
                                //         $query->has('transportschedule', '>=', DB::raw(1));
                                //     });
                                // })
                                ->with(array('productorder' => function($query){
                                    $query->addSelect(array('id', 'order_id', 'product_id'))
                                            ->has('transportscheduleproduct');
                                }))
                                // ->has('productorder.transportscheduleproduct.transportschedule')
                                ->where('id', '=', $product['id'])
                                ->get(array('id', 'name'))->toArray();

            array_push($temp, $result);
        }
        return $temp;
    }
    
}
