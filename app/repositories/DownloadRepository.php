<?php

class DownloadRepository implements DownloadInterface 
{
	public function download($params)
	{
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
					if(!array_key_exists('model', $q)) { $_404 = true; break; }

					switch ($q['model']) {
						case 'order':
							if(!array_key_exists('id', $q)) { $_404 = true; break; }

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
							if(!array_key_exists('id', $q)) { $_404 = true; break; }
							
							$report_o = $this->generateProducerStatement($q);
							
							if(!$report_o) { $_404 = true; break; }

							return PDF::loadView(
												'pdf.base',
												array(
													'child' => View::make('reports.producer-header-pdf', array('report_o' => $report_o,))->nest('_nest_content', 'reports.producer-content', array('report_o' => $report_o))
												) 
											)->stream('SOA - '.$report_o->name.'.pdf');
							break;

						default:
							$_404 = true;
							break;
					}
					break;

				case 'excel':
					if(!array_key_exists('model', $q)) { $_404 = true; break; }

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
							if(!array_key_exists('id', $q)) { $_404 = true; break; }
							
							$report_o = $this->generateProducerStatement($q);
							
							if(!$report_o) { $_404 = true; break; }

							if(strcmp($format,'csv') === 0) {
								return Excel::create('SOA - '.$report_o->name, function($excel) use($report_o) {
										        $excel->sheet($report_o->name, function($sheet) use($report_o) {
										        	$sheet->setColumnFormat(array('G' => '0.0000'));
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
										        	$sheet->setColumnFormat(array('G' => '0.0000'));

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

	private function generateProducerStatement($_params = array()){
		$_dateBetween['start'] = array_key_exists('dateStart',$_params) ? date('Y-m-d \0\0\:\0\0\:\0\0', strtotime($_params['dateStart'])) : date('Y-m-d \0\0\:\0\0\:\0\0');
		$_dateBetween['end'] = array_key_exists('dateEnd',$_params) ? date('Y-m-d \2\3\:\5\9\:\5\9', strtotime($_params['dateEnd'])) : date('Y-m-d \2\3\:\5\9\:\5\9');
		
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
	                        ->where('id','=',$_params['id'])
	                        ->first();

        if(!$report_o) return false;

        $report_a = $report_o->toArray();
        $report_a['report_date'] = $_dateBetween;
        $report_a['scale_fees'] = 0.00;
        $report_a['amount'] = 0.00;

        if(sizeof($report_a['storagelocation']) == 0) return $report_o;

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
	                    $ii = $this->intcmp($pickup_gross_i,$dropoff_gross_i);
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

	private function intcmp($a, $b) {
		return (intval($a) - intval($b)) ? (intval($a) - intval($b)) / abs(intval($a) - intval($b)) : 0;
	}

	private function parse(array $arr) {
	    return json_decode(json_encode($arr));
	}
}