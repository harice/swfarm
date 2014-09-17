<?php

class DownloadRepository implements DownloadInterface 
{
	public function download($params) {
		$_404 = false;
		$q = unserialize(base64_decode($params['q']));
		// var_dump($q);exit;
		if(!is_array($q) && !array_key_exists('type', $q)) $_404 = true;

		if(!$_404) {
			switch ($q['type']) {
				case 'doc':
					if(!array_key_exists('id', $q)) { $_404 = true; break; }

					$file_o = Document::where('issave', '=', 1)->where('id', '=', $q['id'])->first();
			        if($file_o){
		        		header('Pragma: public');
	        			header('Expires: 0');
	        			header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			        	header('Content-Description: File Transfer');
			        	header('Content-Transfer-Encoding: binary');
			        	header('Content-Type: '.$file_o->type);

			        	if(!array_key_exists('dl', $q)) { readfile($file_o->content); break; }

			        	$filename = time();
			        	$ext = '.pdf';

			        	switch ($file_o->type) {
			        		case 'application/pdf':
			        			$ext = '.pdf';
			        			break;
			        	}

	        			$model_o = $file_o->documentable;
	        			if(is_object($model_o)) {
		        			switch(get_class($model_o)) {
		        				case 'ProductOrder':
		        					$filename = $model_o->order->order_number .'-'.$model_o->stacknumber;
		        					break;
		        			}
		        		}

	        			header('Content-Disposition: attachment; filename="'.$filename.$ext.'"');
			        	readfile($file_o->content);
			        } else $_404 = true;
					break;

				case 'pdf':
					if(!$this->filterParams($q,array('model'))) { $_404 = true; break; }

					switch ($q['model']) {
						case 'order':
							if(!$this->filterParams($q,array('id'))) { $_404 = true; break; }

							$order = Order::with('productsummary.productname')
						                ->with('productsummary.productorder.product')
						                ->with('productsummary.productorder.document')
						                ->with('productsummary.productorder.sectionfrom.storagelocation')
						                ->with('account')
						                ->with('contact')
						                ->with('orderaddress', 'orderaddress.addressStates')
						                ->with('location')
						                ->with('status')
						                ->with('ordercancellingreason.reason')
										->with('contract.account')
										->find($q['id']);

							if($order) {
								return PDF::loadView('pdf.base', array('child' => View::make('pdf.order',array('order'=>$order))))->stream($order->order_number.'.pdf');
							} else $_404 = true;
							break;

						case 'producer-statement':
							if(!$this->filterParams($q,array('filterId'))) { $_404 = true; break; }
							
							$report_o = $this->generateProducerStatement($q);
							if(!$report_o) { $_404 = true; break; }

							return PDF::loadView('pdf.base',array('child' => View::make('reports.producer-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.producer-content', array('report_o' => $report_o))))->stream('SOA - '.$report_o->name.'.pdf');
							break;

						case 'customer-sales-statement':
							if(!$this->filterParams($q,array('filterId'))) { $_404 = true; break; }

							$report_o = $this->generateCustomerStatement($q);
							if(!$report_o) { $_404 = true; break; }

							return PDF::loadView('pdf.base',array('child' => View::make('reports.customer-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.customer-content', array('report_o' => $report_o))))->stream('SOA - '.$report_o->name.'.pdf');
							break;

						case 'driver-pay-statement':
							if(!$this->filterParams($q,array('filterId'))) { $_404 = true; break; }

							$report_o = $this->generateDriversPay($q);
							if(!$report_o) { $_404 = true; break; }

							return PDF::loadView('pdf.base',array('child' => View::make('reports.driver-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.driver-content', array('report_o' => $report_o))))->stream('SOA - '.$report_o->lastname.'-'.$report_o->firstname.'.pdf');
							break;

						default:
							$_404 = true;
							break;
					}
					break;

				case 'excel':
					if(!$this->filterParams($q,array('model'))) { $_404 = true; break; }

					if(!array_key_exists('format', $q)) $format = 'xls';
					else {
						switch ($q['format']) {
							case 'csv':
								$format = 'csv';
								break;

							case 'xlsx':
								$format = 'xlsx';
								break;

							case 'xls':
							default:
								$format = 'xls';
								break;
						}
					}

					switch($q['model']) {
						case 'producer-statement':
							if(!$this->filterParams($q,array('filterId'))) { $_404 = true; break; }
							
							$report_o = $this->generateProducerStatement($q);
							
							if(!$report_o) { $_404 = true; break; }

							if(strcmp($format,'csv') === 0) {
								return Excel::create('SOA - '.$report_o->name, function($excel) use($report_o) {
										        $excel->sheet($report_o->name, function($sheet) use($report_o) {
										        	$sheet->setColumnFormat(array('E' => '0.00','F' => '0.00','G' => '0.0000','I' => '0.00'));
										        	$sheet->loadView(
										        		'reports.producer-header-excel',
										        		array(
										        			'report_o' => $report_o,
										        			'_nest_content' => View::make('reports.producer-content', array('report_o' => $report_o))
									        			)
								        			);
										        });
										    })->download($format);
							} else {
								return Excel::create('SOA - '.$report_o->name, function($excel) use($report_o) {
										        $excel->sheet($report_o->name, function($sheet) use($report_o) {
													$sheet->setAutoSize(true);
										        	$sheet->mergeCells('A1:A3');
										        	$sheet->setFreeze('A4');

										        	$objDrawing = new PHPExcel_Worksheet_Drawing();
										        	$objDrawing->setPath(public_path("images/southwest-farm-services-logo-pdf.jpg"));
										        	$objDrawing->setCoordinates('A1');
										        	$objDrawing->setWorksheet($sheet);

										        	$sheet->getStyle('G11')->getFont()->getColor()->setARGB(PHPExcel_Style_Color::COLOR_RED);
										        	$sheet->setColumnFormat(array('E' => '0.00','F' => '0.00','G' => '0.0000','I' => '0.00'));
										        	$sheet->setWidth(array('A' =>  24,'B' =>  15,'C' =>  20,'D' =>  20,'E' =>  10,'F' =>  15,'G' =>  12,'H' =>  10,'I' =>  15));

										        	$sheet->loadView(
										        		'excel.base',
										        		array(
										        			'colspan' => 8,
										        			'child' => View::make('reports.producer-header-excel',array('report_o' => $report_o))->nest('_nest_content', 'reports.producer-content', array('report_o' => $report_o))
									        			)
								        			);
										        });
										    })->download($format);
							}
							break;

						case 'customer-sales-statement':
							if(!$this->filterParams($q,array('filterId'))) { $_404 = true; break; }
							
							$report_o = $this->generateCustomerStatement($q);
							
							if(!$report_o) { $_404 = true; break; }

							if(strcmp($format,'csv') === 0) {
								return Excel::create('SOA - '.$report_o->name, function($excel) use($report_o) {
										        $excel->sheet($report_o->name, function($sheet) use($report_o) {
										        	$sheet->setColumnFormat(array('E' => '0.00','F' => '0.0000','G' => '0.00','H' => '0.00'));
										        	$sheet->loadView(
										        		'reports.customer-header-excel',
										        		array(
										        			'report_o' => $report_o,
										        			'_nest_content' => View::make('reports.customer-content', array('report_o' => $report_o))
									        			)
								        			);
										        });
										    })->download($format);
							} else {
								return Excel::create('SOA - '.$report_o->name, function($excel) use($report_o) {
										        $excel->sheet($report_o->name, function($sheet) use($report_o) {
													$sheet->setAutoSize(true);
										        	$sheet->mergeCells('A1:A3');
										        	$sheet->setFreeze('A4');

										        	$objDrawing = new PHPExcel_Worksheet_Drawing();
										        	$objDrawing->setPath(public_path("images/southwest-farm-services-logo-pdf.jpg"));
										        	$objDrawing->setCoordinates('A1');
										        	$objDrawing->setWorksheet($sheet);

										        	$sheet->setColumnFormat(array('E' => '0.00','F' => '0.0000','G' => '0.00','H' => '0.00'));
										        	$sheet->setWidth(array('A' =>  24,'B' =>  15,'C' =>  20,'D' =>  10,'E' =>  15,'F' =>  12,'G' =>  10,'H' =>  15));

										        	$sheet->loadView(
										        		'excel.base',
										        		array(
										        			'colspan' => 7,
										        			'child' => View::make('reports.customer-header-excel',array('report_o' => $report_o))->nest('_nest_content', 'reports.customer-content', array('report_o' => $report_o))
									        			)
								        			);
										        });
										    })->download($format);
							}
							break;

						case 'driver-pay-statement':
							if(!$this->filterParams($q,array('filterId'))) { $_404 = true; break; }

							$report_o = $this->generateDriversPay($q);
							if(!$report_o) { $_404 = true; break; }

							if(strcmp($format,'csv') === 0) {
								return Excel::create('SOA - '.$report_o->lastname.'-'.$report_o->firstname, function($excel) use($report_o) {
										        $excel->sheet($report_o->lastname.'-'.$report_o->firstname, function($sheet) use($report_o) {
										        	$sheet->setColumnFormat(array('C' => '0.00','E' => '0.0000','F' => '0.00','H' => '0.00'));
										        	$sheet->loadView(
										        		'reports.driver-header-excel',
										        		array(
										        			'report_o' => $report_o,
										        			'_nest_content' => View::make('reports.driver-content', array('report_o' => $report_o))
									        			)
								        			);
										        });
										    })->download($format);
							} else {
								return Excel::create('SOA - '.$report_o->lastname.'-'.$report_o->firstname, function($excel) use($report_o) {
										        $excel->sheet($report_o->lastname.'-'.$report_o->firstname, function($sheet) use($report_o) {
													$sheet->setAutoSize(true);
										        	$sheet->mergeCells('A1:A3');
										        	$sheet->setFreeze('A4');

										        	$objDrawing = new PHPExcel_Worksheet_Drawing();
										        	$objDrawing->setPath(public_path("images/southwest-farm-services-logo-pdf.jpg"));
										        	$objDrawing->setCoordinates('A1');
										        	$objDrawing->setWorksheet($sheet);

										        	$sheet->setColumnFormat(array('C' => '0.00','E' => '0.0000','F' => '0.00','H' => '0.00'));
										        	$sheet->setWidth(array('A' =>  24,'B' =>  15,'C' =>  20,'D' =>  10,'E' =>  15,'F' =>  12,'G' =>  10,'H' =>  15));

										        	$sheet->loadView(
										        		'excel.base',
										        		array(
										        			'colspan' => 7,
										        			'child' => View::make('reports.driver-header-excel',array('report_o' => $report_o))->nest('_nest_content', 'reports.driver-content', array('report_o' => $report_o))
									        			)
								        			);
										        });
										    })->download($format);
							}
							break;

						default:
							$_404 = true;
							break;
					}
					break;

				default:
					$_404 = true;
					break;
			}
		}

		if($_404) return Redirect::to('404')->withPage('file');
		exit();
	}

	public function report($q, $type){
		$_error = false;
		$report_o = array();
		switch($type){
			case Config::get('constants.REPORT_COMMISSION'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }
				break;

			case Config::get('constants.REPORT_CUSTOMER'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateCustomerStatement($q);
				if(!$report_o) { $_404 = true; break; }
				break;

			case Config::get('constants.REPORT_DRIVER'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateDriversPay($q);
				if(!$report_o) { $_error = true; break; }
				break;

			case Config::get('constants.REPORT_GROSS_PROFIT'):
				break;

			case Config::get('constants.REPORT_INVENTORY'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }
				break;

			case Config::get('constants.REPORT_OPERATOR'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }
				break;

			case Config::get('constants.REPORT_PRODUCER'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateProducerStatement($q);
				if(!$report_o) { $_error = true; break; }
				break;

			case Config::get('constants.REPORT_TRUCKING'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateTruckingStatement($q);
				if(!$report_o) { $_error = true; break; }
				break;
		}

		if($_error) return App::abort(501,'Not implemented');
		return Response::json($report_o);
	}

	private function generateProducerStatement($_params = array()){
		$_dateBetween = $this->generateBetweenDates($_params);
		$report_o = Account::with('businessaddress.state')
	                        ->with('storagelocation')
	                        ->with('storagelocation.section')
	                        ->with(array('storagelocation.section.productorder' => function($query) use($_dateBetween) {
	                        	$query->join('products', 'products.id', '=', 'productorder.product_id');
	                            $query->join('order', 'order.id', '=', 'productorder.order_id');
	                            $query->join('transportscheduleproduct','productorder_id', '=', 'productorder.id');
	                            $query->join('transportschedule', 'transportschedule.id','=','transportscheduleproduct.transportschedule_id');
	                            $query->join('weightticket', 'weightticket.transportschedule_id','=','transportschedule.id');
	                            $query->where('order.ordertype','=',Config::get('constants.ORDERTYPE_PO'));
	                            $query->where('weightticket.status_id','=',Config::get('constants.STATUS_CLOSED'));
	                            $query->whereBetween('weightticket.updated_at',array_values($_dateBetween));
	                            $query->orderBy('weightticket.updated_at','DESC');
	                            $query->select(
	                                array(
	                                        'section_id',
	                                        'stacknumber',
	                                        'products.name as product',
	                                        'order_number',
	                                        'weightticketnumber',
	                                        'unitprice',
	                                        'transportscheduleproduct.id as transportscheduleproduct_id',
	                                        'weightticket.id as weightticket',
	                                        'weightticket.updated_at',
	                                    )
	                                );
	                        }))
	                        ->where('id','=',$_params['filterId'])
	                        ->first();

        if(!$report_o) return false;

        $report_a = $report_o->toArray();
        $report_a['report_date'] = $_dateBetween;
        $report_a['scale_fees'] = 0.00;
        $report_a['amount'] = 0.00;

        if(sizeof($report_a['storagelocation']) == 0) return $this->parse($report_a);

        $weightticket_a = array();
	    $scale_i = $amount_i = 0.00;
	    foreach ($report_a['storagelocation'] as $skey => $storagelocation_a) {
	        if(sizeof($storagelocation_a['section']) == 0) break;
	        $prev_key = 0;
	        foreach ($storagelocation_a['section'] as $ckey => $section_a) {
	            if(sizeof($section_a['productorder']) == 0) break;

	            $load_count = 0;
	            $next_key = intval($section_a['id']);

	            foreach ($section_a['productorder'] as $pkey => $product_a) {
	                if(array_key_exists($product_a['weightticket'], $weightticket_a)) {
	                    $ticket_o = $weightticket_a[$product_a['weightticket']];
	                    if(intval($prev_key) != $next_key) $load_count++;
	                } else {
	                    $ticket_o = WeightTicket::with('weightticketscale_pickup.weightticketproducts')
	                                            ->with('weightticketscale_dropoff.weightticketproducts')
	                                            ->select(array('id','pickup_id','dropoff_id'))
	                                            ->find($product_a['weightticket']);

	                    $weightticket_a[$ticket_o->id] = $ticket_o;
	                    $load_count++;
	                }

	                $pickup_a = $dropoff_a = array();
	                $pickup_gross_i = $dropoff_gross_i = 0.0000;
	                $totalp_i = 0;
	                if(!is_null($ticket_o->weightticketscale_pickup) && sizeof($ticket_o->weightticketscale_pickup->weightticketproducts) > 0) {
	                    $scale_i += floatval($ticket_o->weightticketscale_pickup->fee);
	                    $pickup_gross_i = floatval($ticket_o->weightticketscale_pickup->gross) - floatval($ticket_o->weightticketscale_pickup->tare);
	                    foreach($ticket_o->weightticketscale_pickup->weightticketproducts as $wp){
	                        if(intval($wp->transportScheduleProduct_id) === intval($product_a['transportscheduleproduct_id'])) {
	                            $pickup_a['bales'] = number_format($wp->bales,0);
	                            $pickup_a['pounds'] = number_format($wp->pounds,2,'.',',');
	                            $pickup_a['tons'] = number_format($wp->tons,4,'.',',');
	                            break;
	                        }
	                    }
	                }

	                if(!is_null($ticket_o->weightticketscale_dropoff) && sizeof($ticket_o->weightticketscale_dropoff->weightticketproducts) > 0) {
	                    $scale_i += floatval($ticket_o->weightticketscale_dropoff->fee);
	                    $dropoff_gross_i = floatval($ticket_o->weightticketscale_dropoff->gross) - floatval($ticket_o->weightticketscale_dropoff->tare);
	                    foreach($ticket_o->weightticketscale_dropoff->weightticketproducts as $wp){
	                        if(intval($wp->transportScheduleProduct_id) === intval($product_a['transportscheduleproduct_id'])) {
	                            $dropoff_a['bales'] = number_format($wp->bales,0);
	                            $dropoff_a['pounds'] = number_format($wp->pounds,2,'.',',');
	                            $dropoff_a['tons'] = number_format($wp->tons,4,'.',',');
	                            break;
	                        }
	                    }
	                }

	                if(!is_null($ticket_o->weightticketscale_pickup) && !is_null($ticket_o->weightticketscale_dropoff)) {
	                    $ii = bccomp($pickup_gross_i,$dropoff_gross_i,4);
	                    switch ($ii) {
	                        case -1:
	                            $product_a = array_merge($product_a,$pickup_a);
	                            $totalp_i = $pickup_a['tons'] * $product_a['unitprice'];
	                            $amount_i += $totalp_i;
	                            break;

	                        case 1:
	                        case 0:
	                        default:
	                            $product_a = array_merge($product_a,$dropoff_a);
	                            $totalp_i = floatval($dropoff_a['tons']) * floatval($product_a['unitprice']);
	                            $amount_i += $totalp_i;
	                            break;
	                    }
	                } else if(!is_null($ticket_o->weightticketscale_pickup) && is_null($ticket_o->weightticketscale_dropoff)) {
	                    $product_a = array_merge($product_a,$pickup_a);
	                    $totalp_i = $pickup_a['tons'] * $product_a['unitprice'];
                        $amount_i += $totalp_i;
	                } else {
	                    $product_a = array_merge($product_a,$dropoff_a);
	                    $totalp_i = $dropoff_a['tons'] * $product_a['unitprice'];
                        $amount_i += $totalp_i;
	                }

	                $report_a['storagelocation'][$skey]['section'][$ckey]['load_count'] = $load_count;
	                $report_a['storagelocation'][$skey]['section'][$ckey]['productorder'][$pkey] = $product_a;

	                if(intval($prev_key) == 0)
	                	$prev_key = $next_key;
	                else {
	                	if(intval($prev_key) != $next_key) 
	                		$prev_key = $next_key;
	                }
	            }
	        }
	    }

	    $report_a['scale_fees'] = $scale_i;
	    $report_a['amount'] = $amount_i;
	    $report_a['total_load'] = sizeof($weightticket_a);
	    return $this->parse($report_a);
	}

	public function generateCustomerStatement($_params = array()) {
		$_dateBetween = $this->generateBetweenDates($_params);
		$report_o = Account::with('businessaddress.state')
                        ->with(array('order' => function($query) use($_dateBetween) {
                            $query->join('natureofsale','natureofsale.id','=','order.natureofsale_id')
                            	->join('productorder','productorder.order_id','=','order.id')
                                ->join('transportscheduleproduct','transportscheduleproduct.productorder_id','=','productorder.id')
                                ->join('transportschedule','transportschedule.id','=','transportscheduleproduct.transportschedule_id')
                                ->join('weightticket','weightticket.transportschedule_id','=','transportschedule.id')
                                ->where('order.ordertype','=',Config::get('constants.ORDERTYPE_SO'))
                                ->where('transportschedule.status_id','=',Config::get('constants.STATUS_CLOSED'))
                                ->where('weightticket.status_id','=',Config::get('constants.STATUS_CLOSED'))
                                ->whereBetween('weightticket.updated_at',array_values($_dateBetween))
                                ->whereNotNull('weightticket.pickup_id')
                                ->orderBy('order.created_at','DESC')
                                ->groupBy('order.id')
                                ->select(array(
                                            'order.id', 
                                            'account_id', 
                                            'order_number',
                                            'natureofsale.name as natureofsale'
                                        ));
                        }))
                        ->where('id','=',$_params['filterId'])
                        ->first();
    	
	    if(!$report_o) return false;

	    $report_a = $report_o->toArray();
	    $report_a['report_date'] = $_dateBetween;
	    $report_a['amount'] = 0.00;
	    $amount_i = 0.00;
	    
	    if($report_o->order->count() == 0) return $this->parse($report_a);

	    foreach ($report_a['order'] as $order_key => $order_a) {
	        $product_a = ProductOrderSummary::join('products','products.id','=','productordersummary.product_id')
	                                ->with(array('productorder' => function($query) use($_dateBetween) {
	                                    $query->join('transportscheduleproduct','transportscheduleproduct.productorder_id','=','productorder.id')
	                                        ->join('transportschedule','transportschedule.id','=','transportscheduleproduct.transportschedule_id')
	                                        ->join('weightticket','weightticket.transportschedule_id','=','transportschedule.id')
	                                        ->join('weightticketscale','weightticketscale.id','=','weightticket.pickup_id')
	                                        ->join('weightticketproducts','weightticketproducts.transportscheduleproduct_id','=','transportscheduleproduct.id')
	                                        ->where('weightticket.status_id','=',Config::get('constants.STATUS_CLOSED'))
	                                        ->whereBetween('weightticket.updated_at',array_values($_dateBetween))
	                                        ->whereNotNull('weightticket.pickup_id')
	                                        ->select(array(
	                                            'productordersummary_id',
	                                            'weightticket.id as wid',
	                                            'weightticket.updated_at',
	                                            'weightticket.weightTicketNumber',
	                                            'weightticketproducts.bales',
	                                            'weightticketproducts.pounds'
	                                        ));
	                                }))
	                                ->whereHas('productorder', function($query) use($_dateBetween) {
	                                    $query->join('transportscheduleproduct','transportscheduleproduct.productorder_id','=','productorder.id')
	                                        ->join('transportschedule','transportschedule.id','=','transportscheduleproduct.transportschedule_id')
	                                        ->join('weightticket','weightticket.transportschedule_id','=','transportschedule.id')
	                                        ->join('weightticketscale','weightticketscale.id','=','weightticket.pickup_id')
	                                        ->join('weightticketproducts','weightticketproducts.transportscheduleproduct_id','=','transportscheduleproduct.id')
	                                        ->where('weightticket.status_id','=',Config::get('constants.STATUS_CLOSED'))
	                                        ->whereBetween('weightticket.updated_at',array_values($_dateBetween))
	                                        ->whereNotNull('weightticket.pickup_id');
	                                })
	                                ->where('order_id','=',$order_a['id'])
	                                ->orderBy('products.name','ASC')
	                                ->select(array('productordersummary.id','products.name as product','unitprice'))
	                                ->get()
	                                ->toArray();

	        foreach ($product_a as $product_key => $product) {
	            $productorder_a = array();
	            $_tons = 0.0000;
	            foreach ($product['productorder'] as $productorder_key => $productorder) {
	                if(array_key_exists($productorder['wid'], $productorder_a)) {
	                    $productorder_a[$productorder['wid']]['bales'] = intval($productorder_a[$productorder['wid']]['bales']) + intval($productorder['bales']);
	                    $productorder_a[$productorder['wid']]['pounds'] = floatval($productorder_a[$productorder['wid']]['pounds']) + floatval($productorder['pounds']);
	                    $productorder_a[$productorder['wid']]['tons'] = floatval($productorder_a[$productorder['wid']]['pounds']) * 0.0005;

	                    $_lbstons = floatval($productorder['pounds']) * 0.0005;
                    	$_tons += $_lbstons;
	                } else {
	                    $productorder_a[$productorder['wid']] = $productorder;
	                    $productorder_a[$productorder['wid']]['tons'] = floatval($productorder['pounds']) * 0.0005;
	                    $_tons += $productorder_a[$productorder['wid']]['tons'];
	                }
	            }
	            $product_a[$product_key]['productorder'] = array_values($productorder_a);
	            $amount_p = $_tons * $product['unitprice'];
            	$amount_i += $amount_p; 
	        }

	        $report_a['order'][$order_key]['productsummary'] = $product_a;
	    }

	    $report_a['amount'] = $amount_i;
	    return $this->parse($report_a);
	}

	private function generateDriversPay($_params = array()) {
		$_dateBetween = $this->generateBetweenDates($_params);
		$report_o = Contact::join('account','account.id','=','account')
                    ->with(array('order' => function($query) use($_dateBetween) {
                        $query->whereBetween('transportschedule.updated_at',array_values($_dateBetween))
                            ->select(array('trucker_id','order.id as id','order.order_number'))
                            ->where('transportschedule.status_id','=',Config::get('constants.STATUS_CLOSED'))
                            ->orderBy('order.created_at','desc');
                    }))
                    ->where('contact.id','=',$_params['filterId'])
                    ->select(array('contact.id','contact.firstname','contact.lastname','contact.suffix','account.name as account','contact.email','contact.phone','contact.rate'))
                    ->take(1)
                    ->get()
                    ->each(function($trucker) use($_dateBetween) {
                        $trucker->amount = 0.00;
                        $trucker->report_date = (object) $_dateBetween;
                        $trucker->order->each(function($order) use($trucker,$_dateBetween) {
                            $order->transportschedule = TransportSchedule::join('truck','truck.id','=','transportschedule.truck_id')
                                ->with('weightticket.weightticketscale_pickup')
                                ->with('weightticket.weightticketscale_dropoff')
                                ->select(array('transportschedule.id','truck.trucknumber as truck','transportschedule.truckingrate','transportschedule.updated_at'))
                                ->where('transportschedule.order_id','=',$order->id)
                                ->where('transportschedule.trucker_id','=',$order->trucker_id)
                                ->where('transportschedule.status_id','=',Config::get('constants.STATUS_CLOSED'))
                                ->whereBetween('transportschedule.updated_at',array_values($_dateBetween))
                                ->orderBy('transportschedule.updated_at','desc')
                                ->get()
                                ->each(function($transportschedule) use($trucker) {
                                    $transportschedule->weightticket->setVisible(array('weightticketscale_pickup','weightticketscale_dropoff'));

                                    if(
                                        !is_null($transportschedule->weightticket->weightticketscale_pickup) && 
                                        !is_null($transportschedule->weightticket->weightticketscale_dropoff)
                                    ) {
                                        $pickup_net = floatval($transportschedule->weightticket->weightticketscale_pickup->gross) - floatval($transportschedule->weightticket->weightticketscale_pickup->tare);
                                        $dropoff_net = floatval($transportschedule->weightticket->weightticketscale_dropoff->gross) - floatval($transportschedule->weightticket->weightticketscale_dropoff->tare);
                                        $ii = bccomp($pickup_net,$dropoff_net,4);
                                        switch ($ii) {
                                            case -1:
                                                $transportschedule->bales = $transportschedule->weightticket->weightticketscale_pickup->bales;
                                                $transportschedule->tons = $pickup_net;
                                                unset($transportschedule->weightticket);
                                                break;

                                            case 1:
                                            case 0:
                                            default:
                                            	$transportschedule->bales = $transportschedule->weightticket->weightticketscale_dropoff->bales;
                                                $transportschedule->tons = $dropoff_net;
                                                unset($transportschedule->weightticket);
                                                break;
                                        }
                                    } else if(
                                            !is_null($transportschedule->weightticket->weightticketscale_pickup) && 
                                            is_null($transportschedule->weightticket->weightticketscale_dropoff
                                        )) {
                                        $transportschedule->bales = $transportschedule->weightticket->weightticketscale_pickup->bales;
                                        $transportschedule->tons = floatval($transportschedule->weightticket->weightticketscale_pickup->gross) - floatval($transportschedule->weightticket->weightticketscale_pickup->tare);
                                        unset($transportschedule->weightticket);
                                    } else {
                                        $transportschedule->bales = $transportschedule->weightticket->weightticketscale_dropoff->bales;
                                        $transportschedule->tons = floatval($transportschedule->weightticket->weightticketscale_dropoff->gross) - floatval($transportschedule->weightticket->weightticketscale_dropoff->tare);
                                        unset($transportschedule->weightticket);
                                    }

                                    $transportschedule->gross = $transportschedule->tons * $transportschedule->truckingrate;
                                    $transportschedule->pay = $transportschedule->gross * ($trucker->rate / 100);

                                    $trucker->amount = floatval($trucker->amount) + floatval($transportschedule->pay);
                                })->toArray();
                        });
                    })->shift();

		if(!$report_o) return false;
		return $this->parse($report_o->toArray());
	}

	private function generateTruckingStatement($_params = array()){
		$_dateBetween = $this->generateBetweenDates($_params);
		$report_o = Truck::with('account.businessaddress.state')
						->with(array('order' => function($query) use($_dateBetween) {
	                        $query->whereBetween('transportschedule.updated_at',array_values($_dateBetween))
	                            ->select(array('transportschedule.truck_id','order.id as id','order.order_number'))
	                            ->where('transportschedule.status_id','=',Config::get('constants.STATUS_CLOSED'))
	                            ->orderBy('order.created_at','desc');
	                    }))
						->where('id',$_params['filterId'])
						->select(array('id','trucknumber','fee','account_id'))
						->take(1)
						->get()
						->each(function($truck) use($_dateBetween) {
	                        $truck->amount = 0.00;
	                        $truck->report_date = (object) $_dateBetween;
	                        $truck->order->each(function($order) use($truck,$_dateBetween) {
	                            $order->transportschedule = TransportSchedule::join('truck','truck.id','=','transportschedule.truck_id')
	                                ->with('weightticket.weightticketscale_pickup')
	                                ->with('weightticket.weightticketscale_dropoff')
	                                ->with('originloader')
	                                ->with('destinationloader')
	                                ->select(array(
	                                	'transportschedule.id',
	                                	'transportschedule.originloader_id',
	                                	'transportschedule.destinationloader_id',
	                                	'transportschedule.truckingrate',
	                                	'transportschedule.trailerrate',
	                                	'transportschedule.originloaderfee',
	                                	'transportschedule.destinationloaderfee',
	                                	'transportschedule.fuelcharge',
	                                	'transportschedule.updated_at'
                                	))
	                                ->where('transportschedule.order_id','=',$order->id)
	                                ->where('transportschedule.truck_id','=',$order->truck_id)
	                                ->where('transportschedule.status_id','=',Config::get('constants.STATUS_CLOSED'))
	                                ->whereBetween('transportschedule.updated_at',array_values($_dateBetween))
	                                ->orderBy('transportschedule.updated_at','desc')
	                                ->get()
	                                ->each(function($transportschedule) use($truck) {
	                                    $transportschedule->weightticket->setVisible(array(
	                                    	'weightTicketNumber',
	                                    	'weightticketscale_pickup',
	                                    	'weightticketscale_dropoff'
                                    	));

                                    	$transportschedule->weightticketnumber = $transportschedule->weightticket->weightTicketNumber;

	                                    if(
	                                        !is_null($transportschedule->weightticket->weightticketscale_pickup) && 
	                                        !is_null($transportschedule->weightticket->weightticketscale_dropoff)
	                                    ) {
	                                        $pickup_net = floatval($transportschedule->weightticket->weightticketscale_pickup->gross) - floatval($transportschedule->weightticket->weightticketscale_pickup->tare);
	                                        $dropoff_net = floatval($transportschedule->weightticket->weightticketscale_dropoff->gross) - floatval($transportschedule->weightticket->weightticketscale_dropoff->tare);
	                                        $ii = bccomp($pickup_net,$dropoff_net,4);
	                                        switch ($ii) {
	                                            case -1:
	                                                $transportschedule->bales = $transportschedule->weightticket->weightticketscale_pickup->bales;
	                                                $transportschedule->tons = $pickup_net;
	                                                unset($transportschedule->weightticket);
	                                                break;

	                                            case 1:
	                                            case 0:
	                                            default:
	                                            	$transportschedule->bales = $transportschedule->weightticket->weightticketscale_dropoff->bales;
	                                                $transportschedule->tons = $dropoff_net;
	                                                unset($transportschedule->weightticket);
	                                                break;
	                                        }
	                                    } else if(
	                                            !is_null($transportschedule->weightticket->weightticketscale_pickup) && 
	                                            is_null($transportschedule->weightticket->weightticketscale_dropoff
	                                        )) {
	                                        $transportschedule->bales = $transportschedule->weightticket->weightticketscale_pickup->bales;
	                                        $transportschedule->tons = floatval($transportschedule->weightticket->weightticketscale_pickup->gross) - floatval($transportschedule->weightticket->weightticketscale_pickup->tare);
	                                        unset($transportschedule->weightticket);
	                                    } else {
	                                        $transportschedule->bales = $transportschedule->weightticket->weightticketscale_dropoff->bales;
	                                        $transportschedule->tons = floatval($transportschedule->weightticket->weightticketscale_dropoff->gross) - floatval($transportschedule->weightticket->weightticketscale_dropoff->tare);
	                                        unset($transportschedule->weightticket);
	                                    }

	                                    $transportschedule->gross = $transportschedule->tons * $transportschedule->truckingrate;
	                                })->toArray();
	                        });
	                    })->shift();
		return $this->parse($report_o->toArray());
	}

	private function generateBetweenDates($_params = array()) {
		$_dates['start'] = array_key_exists('dateStart',$_params) ? date('Y-m-d \0\0\:\0\0\:\0\0', strtotime($_params['dateStart'])) : date('Y-m-d \0\0\:\0\0\:\0\0');
		$_dates['end'] = array_key_exists('dateEnd',$_params) ? date('Y-m-d \2\3\:\5\9\:\5\9', strtotime($_params['dateEnd'])) : date('Y-m-d \2\3\:\5\9\:\5\9');

		return $_dates;
	}

	private function parse(array $arr) {
	    return json_decode(json_encode($arr));
	}

	private function filterParams($_params,$columns) {
		if(sizeof($_params) < 1) return false;

		foreach ($columns as $key => $value) {
			$bool = array_key_exists($value, $_params);
			if(!$bool) {
				return false;
				break;
			}
		}

		return true;
	}
}