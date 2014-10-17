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
                    array('graphName' => 'Reserve Customers', 'graphId' => Config::get('constants.GRAPH_CUSTOMER_ORDER_VS_DELIVERED'), 'graphType' => Config::get('constants.GRAPH_TYPE_2'), 'data' => $this->reservedDeliveredVsBalanceOrderPerCustomerAccount($params), 'filters' => array('date')),
                    array('graphName' => 'Inventory product on hand', 'graphId' => Config::get('constants.GRAPH_INVENTORY_PRODUCT_ON_HAND'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->inventoryProductOnHand(), 'filters' => array()),
                    array('graphName' => 'Year to date sales', 'graphId' => Config::get('constants.GRAPH_YEAR_TO_DATE_SALES'), 'graphType' => Config::get('constants.GRAPH_TYPE_1'), 'data' => $this->yearToDateSalesPerAccount(), 'filters' => array()),
                    array('graphName' => 'Dashboard Purchases', 'graphId' => Config::get('constants.DASHBOARD_MAP_PRODUCER'), 'graphType' => Config::get('constants.GRAPH_TYPE_3'), 'data' => $this->accountMapCoordinates(Config::get('constants.ACCOUNTTYPE_PRODUCER'))),
                    array('graphName' => 'Dashboard Sales', 'graphId' => Config::get('constants.DASHBOARD_MAP_CUSTOMER'), 'graphType' => Config::get('constants.GRAPH_TYPE_3'), 'data' => $this->accountMapCoordinates(Config::get('constants.ACCOUNTTYPE_CUSTOMER'))),
                    array('graphName' => 'Dashboard Logistics', 'graphId' => Config::get('constants.DASHBOARD_LOGISTICS_MAP'), 'graphType' => Config::get('constants.GRAPH_TYPE_4'), 'data' => $this->logisticRouteMap($params), 'filters' => array('date')),
                    array('graphName' => 'Logistics Summary', 'graphId' => Config::get('constants.DASHBOARD_LOGISTIC_SUMMARY'), 'graphType' => Config::get('constants.GRAPH_TYPE_5'), 'data' => $this->logisticSummary($params), 'filters' => array('date'))
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
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_1');
                    $graph['data'] = $this->inventoryProductOnHand();
                    break;
                case Config::get('constants.GRAPH_YEAR_TO_DATE_SALES'):
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_1');
                    $graph['data'] = $this->yearToDateSalesPerAccount($params);
                    break;  
                case Config::get('constants.DASHBOARD_MAP_PRODUCER'): 
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_3');   
                    $graph['data'] = $this->accountMapCoordinates(Config::get('constants.ACCOUNTTYPE_PRODUCER'));
                    break;            
                case Config::get('constants.DASHBOARD_MAP_CUSTOMER'):    
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_3');
                    $graph['data'] = $this->accountMapCoordinates(Config::get('constants.ACCOUNTTYPE_CUSTOMER'));
                    break;   
                case Config::get('constants.DASHBOARD_LOGISTICS_MAP'):
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_4');    
                    $graph['data'] = $this->logisticRouteMap($params);
                    break;               
                case Config::get('constants.DASHBOARD_LOGISTIC_SUMMARY'):
                    $graph['graphType'] = Config::get('constants.GRAPH_TYPE_5');    
                    $graph['data'] = $this->logisticSummary($params);
                    break;               
                default:
                    # code...
                    break;
            }
        }

        return $graph;

    }
    
    public function purchaseInTons($params){
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d H:i:s');
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d H:i:s', strtotime("-1 day"));
        
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
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d H:i:s');
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d H:i:s', strtotime("-1 day"));

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
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d H:i:s');
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d H:i:s', strtotime("-1 day"));

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
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d H:i:s');
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d H:i:s', strtotime("-1 day"));

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
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d H:i:s');
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d H:i:s', strtotime("-1 day"));

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

    /*public function inventoryProductOnHand($params){
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
                                // ->with(array('productorder.transportscheduleproduct' => function($query){
                                //     $query->has('transportschedule');
                                // }))
                                ->with(array('productorder' => function($query){
                                    $query->addSelect(array('id', 'order_id', 'product_id'))
                                          ->whereHas('transportscheduleproduct', function($query){
                                                $query->has('transportschedule', '>=', DB::raw(1));
                                          });
                                }))
                                // ->has('productorder.transportscheduleproduct.transportschedule')
                                ->where('id', '=', $product['id'])
                                ->get(array('id', 'name'))->toArray();

            array_push($temp, $result);
        }

        foreach($products as $product){

        }
        return $temp;
    }*/

    public function inventoryProductOnHand(){
        // $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d 00:00:00', strtotime("today"));
        // $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d 23:59:59', strtotime("today"));

        $products = Product::with('stack.stacklocation')
                            ->whereHas('stack', function($query){
                                $query->has('stacklocation');
                            })
                            ->orderby('name', 'asc')->get(array('id', 'name'))->toArray();
        
        $response = array();
        $index = 0;
        foreach($products as $product){
            $response[$index]['label'] = $product['name'];
            $response[$index]['value'] = 0;
            foreach($product['stack'] as $stack){
                foreach($stack['stacklocation'] as $stacklocation){
                    $response[$index]['value'] += $stacklocation['tons'];
                }
            }
            $response[$index]['value'] = number_format($response[$index]['value'], 2);
            $index++;
        }

        return $response;
    }

    public function yearToDateSalesPerAccount(){
        $yearAgo = date('Y-m-d 00:00:00', strtotime("-1 year"));
        $dateToday = date('Y-m-d 23:59:59', strtotime("today"));
        // $dateToday = date('Y-m-d 23:59:59', strtotime("2014-09-01"));

        $response = Account::with('order.transportschedule.weightticket.weightticketscale_pickup.weightticketproducts')
                            ->whereHas('order', function($query){
                                $query->where('ordertype', '=', Config::get('constants.ORDERTYPE_SO'))
                                      ->where('status_id', '!=', Config::get('constants.STATUS_CANCELLED'));
                            })
                            ->with(array('order.transportschedule' => function($query) use ($yearAgo, $dateToday){
                                $query->has('weightticket')->wherehas('weightticket', function($query) use ($yearAgo, $dateToday){
                                        $query->whereBetween('created_at', array($yearAgo, $dateToday))
                                              ->where('status_id', '=', Config::get('constants.STATUS_CLOSED'));
                                    });
                            }))
                            ->whereHas('order', function($query){
                                $query->has('transportschedule');
                            })
                            ->get()
                            ->toArray();
                    // return $response;
        $result = array();
        $cnt = 0;
        foreach($response as $account){
            if(count($account['order']) == 0){
                continue;
            }
            $result[$cnt]['account'] = $account['name'];
            $result[$cnt]['totalSales'] = 0;
            foreach($account['order'] as $order){
                if(count($order['transportschedule']) == 0){
                    continue;
                }
                foreach($order['transportschedule'] as $transportschedule){
                    // var_dump($transportschedule['weightticket']['weightticketscale_pickup']['weightticketproducts']);exit;
                    // var_dump($result[$cnt]['account']);
                    foreach($transportschedule['weightticket']['weightticketscale_pickup']['weightticketproducts'] as $product){
                        //getting the unitprice for the formula
                        $productOrder = ProductOrder::with('transportscheduleproduct.weightticketproducts')
                                    ->whereHas('transportscheduleproduct', function($query) use ($product){
                                        $query->whereHas('weightticketproducts', function($query) use ($product){
                                            $query->where('id', '=', $product['id']);
                                        });
                                    })->first(array('id', 'unitprice'))->toArray();
                        // var_dump($product['pounds'].'-'.$productOrder['unitprice']);

                        $result[$cnt]['totalSales'] += ($product['pounds'] * 0.0005) * $productOrder['unitprice']; //convert to tons first
                        // var_dump($result[$cnt]['totalSales']);
                    }
                }
            }
            $cnt++;
        }
        return $result;

    }

    public function accountMapCoordinates($accountType){
        $accounts = Account::with('address')
                  ->with('address.addressStates')
                  ->with(array('address' => function($query){
                        $query->addSelect(array('id', 'account', 'street', 'state', 'city', 'country', 'longitude', 'latitude'))
                              ->whereIn('type', array(Config::get('constants.ADDRESSTYPE_BUSINESS'), Config::get('constants.ADDRESSTYPE_STACK')));
                  }))
                  ->whereHas('accounttype', function($q) use($accountType) { $q->where('accounttype_id','=', $accountType); } )
                  ->orderBy('name', 'asc')
                  ->get(array('id', 'name'));

        return $accounts->toArray();
    }

    public function logisticRouteMap($params){
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d 00:00:00', strtotime("today"));
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d 23:59:59', strtotime("today"));

        $order = Order::with('transportschedule.transportmap')
                        ->with(array('transportschedule.transportmap' => function($query){
                            $query->addSelect(array('id', 'transportschedule_id', 'longitudeFrom', 'latitudeFrom', 'longitudeTo', 'latitudeTo', 'distance', 'isLoadedDistance'));
                        }))
                        ->with(array('transportschedule' => function($query){
                            // $query->whereHas('transportmap');
                            $query->addSelect(array('id', 'order_id', 'date'))->has('transportmap', '>=', DB::raw(1));
                        }))
                        ->whereHas('transportschedule', function($query) use ($dateFrom, $dateTo){
                            $query->has('transportmap')->whereBetween('date', array($dateFrom, $dateTo));
                        })

                        ->get(array('id', 'order_number'))->toArray();

        return $order;
    }

    public function logisticSummary($params){
        $dateFrom = isset($params['dateFrom']) ? $params['dateFrom']." 00:00:00" : date('Y-m-d 00:00:00', strtotime("today"));
        $dateTo = isset($params['dateTo']) ? $params['dateTo']." 23:59:59" : date('Y-m-d 23:59:59', strtotime("today"));

        /*$result = Product::with('productorder.transportscheduleproduct.transportschedule')
                         ->with(array('productorder.transportscheduleproduct.transportschedule' => function($query) use ($dateFrom, $dateTo){
                                $query->whereBetween('date', array($dateFrom, $dateTo));
                         }))
                         ->with(array('productorder.transportscheduleproduct' => function($query){
                                $query->addSelect(array('id', 'transportschedule_id', 'productorder_id', 'quantity'))
                                      ->has('transportschedule', '>=', DB::raw(1));
                         }))
                         ->with(array('productorder' => function($query){
                                $query->addSelect(array('id', 'order_id', 'product_id'))
                                      ->has('transportscheduleproduct', '>=', DB::raw(1))
                                      ->whereHas('transportscheduleproduct', function($query){
                                            $query->has('transportschedule');
                                      });
                         }))
                         ->whereHas('productorder', function($query){
                                $query->has('transportscheduleproduct');
                                      // ->whereHas('transportscheduleproduct', function($query){
                                      //       $query->has('transportschedule');
                                      // });
                         })
                         ->get(array('id', 'name'))->toArray();
        */
        //for order with schedule
        $order1 = DB::table('products')
                        ->join('productorder', 'products.id', '=', 'productorder.product_id')
                        ->join('transportscheduleproduct', 'productorder.id', '=', 'transportscheduleproduct.productorder_id')
                        ->join('transportschedule', 'transportscheduleproduct.transportschedule_id', '=', 'transportschedule.id')
                        ->leftJoin('weightticket', function($query){
                            $query->on('transportschedule.id', '=', 'weightticket.transportSchedule_id')
                                  ->where('weightticket.status_id', '=', Config::get('constants.STATUS_CLOSED'));
                        })
                        ->leftJoin('weightticketscale as ws1', 'weightticket.pickup_id', '=', 'ws1.id')
                        ->leftJoin('weightticketscale as ws2', 'weightticket.dropoff_id', '=', 'ws2.id')
                        // ->leftJoin('weightticketproducts as wsp1', 'ws1.id', '=', 'wsp1.weightTicketScale_id')
                        // ->leftJoin('weightticketproducts as wsp2', 'ws2.id', '=', 'wsp2.weightTicketScale_id')
                        // ->leftJoin('weightticketproducts', 'weightticketproducts.transportScheduleProduct_id', '=', 'transportscheduleproduct.id')
                        // ->leftJoin('weightticketscale', 'weightticketscale.id', '=', 'weightticketproducts.weightTicketScale_id')
                        ->join('order', 'order.id', '=', 'productorder.order_id')
                        ->whereBetween('transportschedule.date', array($dateFrom, $dateTo))
                        ->whereIn('order.status_id', array(Config::get('constants.STATUS_OPEN'), Config::get('constants.STATUS_CLOSED')))
                        // ->where('orderType', '=', Config::get('constants.ORDERTYPE_SO'))
                        ->select('products.id as productId', 'products.name')
                        ->addSelect('transportschedule.id as transportscheduleId', 'transportschedule.date')
                        ->addSelect('transportscheduleproduct.id as transportscheduleproductId', 'transportscheduleproduct.quantity')
                        ->addSelect('order.id as orderId', 'order.order_number', 'order.orderType', 'order.created_at')
                        ->addSelect('productorder.id as productorder_id', 'productorder.tons as productorderTons')
                        ->addSelect('weightticket.id as weightticketId', 'weightticket.pickup_id', 'weightticket.dropoff_id');
                        // ->addSelect('wsp1.id as weightticketproductsId', 'wsp1.pounds as pickupPounds')
                        // ->addSelect('wsp2.id as weightticketproductsId', 'wsp2.pounds as dropoffPounds')
                        // ->addSelect('weightticketproducts.id as weightticketproductsId', 'weightticketproducts.pounds as pickupPounds')
                        // ->addSelect('weightticketscale.id as weightticketscaleId', 'wsp2.pounds as dropoffPounds')
                        // ->get();

                        // $queries = DB::getQueryLog();
                        // $last_query = end($queries);
                        // var_dump($last_query);
                        
        //for order without schedule producer/dropship - PO only
        $orders = DB::table('products')
                        ->join('productorder', 'products.id', '=', 'productorder.product_id')
                        ->leftjoin('transportscheduleproduct', 'productorder.id', '=', 'transportscheduleproduct.productorder_id')
                        ->leftjoin('transportschedule', 'transportscheduleproduct.transportschedule_id', '=', 'transportschedule.id')
                        ->leftJoin('weightticket', function($query){
                            $query->on('transportschedule.id', '=', 'weightticket.transportSchedule_id');
                        })
                        ->leftJoin('weightticketscale as ws1', 'weightticket.pickup_id', '=', 'ws1.id')
                        ->leftJoin('weightticketscale as ws2', 'weightticket.dropoff_id', '=', 'ws2.id')
                        ->join('order', 'order.id', '=', 'productorder.order_id')
                        ->whereBetween('order.created_at', array($dateFrom, $dateTo))
                        ->whereIn('order.status_id', array(Config::get('constants.STATUS_OPEN'), Config::get('constants.STATUS_CLOSED')))
                        ->where('orderType', '=', Config::get('constants.ORDERTYPE_PO'))
                        ->select('products.id as productId', 'products.name')
                        ->addSelect('transportschedule.id as transportscheduleId', 'transportschedule.date')
                        ->addSelect('transportscheduleproduct.id as transportscheduleproductId', 'transportscheduleproduct.quantity')
                        ->addSelect('order.id as orderId', 'order.order_number', 'order.orderType', 'order.created_at')
                        ->addSelect('productorder.id as productorder_id', 'productorder.tons as productorderTons')
                        ->addSelect('weightticket.id as weightticketId', 'weightticket.pickup_id', 'weightticket.dropoff_id')
                        ->union($order1)->get();

        $response = array();
        foreach($orders as $item){
            if(!array_key_exists($item->name, $response)){
                $response[$item->name] = array('productName' => $item->name,'incoming' => 0.0, 'outgoing' => 0.0);
            }
            if($item->orderType == Config::get('constants.ORDERTYPE_PO')){
                if($item->transportscheduleId == null){ //no schedule, the order is either dropship or producer
                    $response[$item->name]['incoming'] += $item->productorderTons;    
                } else if($item->pickup_id == null && $item->dropoff_id == null){
                    $response[$item->name]['incoming'] += $item->quantity;    
                } else if($item->dropoff_id != null){
                    $response[$item->name]['incoming'] += $this->getPoundsOfWeightTicketProduct($item->dropoff_id, $item->transportscheduleproductId) * 0.0005; //in tons
                } else {
                    $response[$item->name]['incoming'] += $this->getPoundsOfWeightTicketProduct($item->pickup_id, $item->transportscheduleproductId) * 0.0005; //in tons
                }
                
            } else if($item->orderType == Config::get('constants.ORDERTYPE_SO')){
                if($item->pickup_id == null && $item->dropoff_id == null){
                    $response[$item->name]['outgoing'] += $item->quantity;    
                } else if($item->pickup_id != null){
                    $response[$item->name]['outgoing'] += $this->getPoundsOfWeightTicketProduct($item->pickup_id, $item->transportscheduleproductId) * 0.0005; //in tons
                } else {
                    $response[$item->name]['outgoing'] += $this->getPoundsOfWeightTicketProduct($item->dropoff_id, $item->transportscheduleproductId) * 0.0005; //in tons
                }
            }
        }
        //formating to 4 decimal places
        foreach($response as &$item){
            $item['incoming'] = number_format($item['incoming'], 4);
            $item['outgoing'] = number_format($item['outgoing'], 4);
        }

        return $response;
    }

    private function getPoundsOfWeightTicketProduct($scaleId, $transportscheduleId){
        $result = WeightTicketProducts::where('weightTicketScale_id', '=', $scaleId)->where('transportScheduleProduct_id', '=', $transportscheduleId)->first(array('pounds'));
        return $result->pounds;
    }
    
}
