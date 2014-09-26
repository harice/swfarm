<?php

class DownloadRepository implements DownloadInterface 
{
	public function download($params,$mail) {
		$_404 = false;

		if(!$mail) {
			$q = unserialize(base64_decode($params['q']));
			if(!is_array($q) && !array_key_exists('type', $q)) $_404 = true;
		} else {
			$q = $params;
		}

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
					if(!$this->filterParams($q,array('model'))) { 
						if($mail) return false;
						else $_404 = true;
						break; 
					}

					switch ($q['model']) {
						case 'order':
							if(!$this->filterParams($q,array('filterId'))) { 
								if($mail) return false;
								else $_404 = true;
								break; 
							}

							$order = $this->getOrderDetails($q['filterId']);
							if($order) {
								$pdf = PDF::loadView('pdf.base', array('child' => View::make('pdf.order',array('order'=>$order))));
								if($mail) {
									$_pathtoFile = storage_path('queue/'.$order->order_number.'.pdf');
									$_data['pathtofile'] = $_pathtoFile;
									$_data['display_name'] = $order->order_number;
									$_data['mime'] = 'application/pdf';
									$_data['subject'] = ( $order->isfrombid == 0 ? ( $order->ordertype == 1 ? 'Purchase Order': 'Sales Order' ) : 'Bid Details' ).' : '. $order->order_number;
									$_data['recipients'] = array_filter(preg_split( "/[;,]/", $q['recipients'] ));

									$pdf->save($_pathtoFile);
									return $this->processMail($q,$_data);
								} else return $pdf->stream($order->order_number.'.pdf');
							} else {
								if($mail) return false;
								else $_404 = true;
							}
							break;

						case 'producer-statement':
							if(!$this->filterParams($q,array('filterId'))) { 
								if($mail) return false;
								else $_404 = true;
								break; 
							}
							
							$report_o = $this->generateProducerStatement($q);
							if($report_o) {
								$pdf = PDF::loadView('pdf.base',array('child' => View::make('reports.producer-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.producer-content', array('report_o' => $report_o))));
								if($mail) {
									$_pathtoFile = storage_path('queue/SOA-'.$report_o->name.'.pdf');
									$_data['pathtofile'] = $_pathtoFile;
									$_data['display_name'] = 'Producer Statement : '.$report_o->name;
									$_data['mime'] = 'application/pdf';
									$_data['subject'] = 'Producer Statement : '.$report_o->name;
									$_data['recipients'] = array_filter(preg_split( "/[;,]/", $q['recipients'] ));

									$pdf->save($_pathtoFile);
									return $this->processMail($q,$_data);
								} else return $pdf->stream('SOA-'.$report_o->name.'.pdf');
							} else { 
								if($mail) return false;
								else $_404 = true;
							}
							break;

						case 'customer-sales-statement':
							if(!$this->filterParams($q,array('filterId'))) { 
								if($mail) return false;
								else $_404 = true;
								break; 
							}

							$report_o = $this->generateCustomerStatement($q);
							if($report_o) { 
								$pdf = PDF::loadView('pdf.base',array('child' => View::make('reports.customer-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.customer-content', array('report_o' => $report_o))));
								if($mail) {
									$_pathtoFile = storage_path('queue/SOA-'.$report_o->name.'.pdf');
									$_data['pathtofile'] = $_pathtoFile;
									$_data['display_name'] = 'Customer Sales Statement : '.$report_o->name;
									$_data['mime'] = 'application/pdf';
									$_data['subject'] = 'Customer Sales Statement : '.$report_o->name;
									$_data['recipients'] = array_filter(preg_split( "/[;,]/", $q['recipients'] ));

									$pdf->save($_pathtoFile);
									return $this->processMail($q,$_data);
								} else return $pdf->stream('SOA-'.$report_o->name.'.pdf');
							} else { 
								if($mail) return false;
								else $_404 = true;
							}
							break;

						case 'driver-pay-statement':
							if(!$this->filterParams($q,array('filterId'))) { 
								if($mail) return false;
								else $_404 = true;
								break; 
							}

							$report_o = $this->generateDriversPay($q);
							if($report_o) { 
								$pdf = PDF::loadView('pdf.base',array('child' => View::make('reports.driver-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.driver-content', array('report_o' => $report_o))));
								if($mail) {
									$_pathtoFile = storage_path('queue/DS-'.$report_o->lastname.' '.$report_o->firstname.'.pdf');
									$_data['pathtofile'] = $_pathtoFile;
									$_data['display_name'] = 'Driver Statement : '.$report_o->lastname.'-'.$report_o->firstname;
									$_data['mime'] = 'application/pdf';
									$_data['subject'] = 'Driver Statement : '.$report_o->lastname.' '.$report_o->firstname;
									$_data['recipients'] = array_filter(preg_split( "/[;,]/", $q['recipients'] ));

									$pdf->save($_pathtoFile);
									return $this->processMail($q,$_data);
								} else return $pdf->stream('DS-'.$report_o->lastname.'-'.$report_o->firstname.'.pdf');
							} else {
								if($mail) return false;
								else $_404 = true;
							}
							break;

						case 'trucking-statement':
							if(!$this->filterParams($q,array('filterId'))) { 
								if($mail) return false;
								else $_404 = true;
								break; 
							}

							$report_o = $this->generateTruckingStatement($q);
							if($report_o) { 
								$pdf = PDF::setPaper('legal')->setOrientation('landscape')->loadView('pdf.base',array('child' => View::make('reports.truck-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.truck-content', array('report_o' => $report_o))));
								if($mail) {
									$_pathtoFile = storage_path('queue/TS-'.$report_o->trucknumber.'.pdf');
									$_data['pathtofile'] = $_pathtoFile;
									$_data['display_name'] = 'Trucking Statement : '.$report_o->trucknumber;
									$_data['mime'] = 'application/pdf';
									$_data['subject'] = 'Trucking Statement : '.$report_o->trucknumber;
									$_data['recipients'] = array_filter(preg_split( "/[;,]/", $q['recipients'] ));

									$pdf->save($_pathtoFile);
									return $this->processMail($q,$_data);
								} else return $pdf->stream('TS-'.$report_o->trucknumber.'.pdf');
							} else {
								if($mail) return false;
								else $_404 = true;
							}
							break;

						case 'operator-statement':
							if(!$this->filterParams($q,array('filterId'))) { 
								if($mail) return false;
								else $_404 = true;
								break; 
							}

							$report_o = $this->generateOperatorStatement($q);
							if($report_o) { 
								$pdf = PDF::loadView('pdf.base',array('child' => View::make('reports.operator-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.operator-content', array('report_o' => $report_o))));
								if($mail) {
									$_pathtoFile = storage_path('queue/OS-'.$report_o->lastname.' '.$report_o->firstname.' '.$report_o->suffix.'.pdf');
									$_data['pathtofile'] = $_pathtoFile;
									$_data['display_name'] = 'Operator Statement : '.$report_o->lastname.' '.$report_o->firstname.' '.$report_o->suffix;
									$_data['mime'] = 'application/pdf';
									$_data['subject'] = 'Operator Statement : '.$report_o->lastname.' '.$report_o->firstname.' '.$report_o->suffix;
									$_data['recipients'] = array_filter(preg_split( "/[;,]/", $q['recipients'] ));

									$pdf->save($_pathtoFile);
									return $this->processMail($q,$_data);
								} else return $pdf->stream('OS-'.$report_o->lastname.' '.$report_o->firstname.' '.$report_o->suffix.'.pdf');
							} else {
								if($mail) return false;
								else $_404 = true;
							}
							break;

						case 'inventory-report':
							if(!$this->filterParams($q,array('filterId'))) { 
								if($mail) return false;
								else $_404 = true;
								break; 
							}

							$report_o = $this->generateInventoryReport($q);
							if($report_o) { 
								$pdf = PDF::setPaper('legal')->setOrientation('landscape')->loadView('pdf.base',array('child' => View::make('reports.inventory-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.inventory-content', array('report_o' => $report_o))));
								if($mail) {
									$_pathtoFile = storage_path('queue/INV-'.$report_o->stacknumber.'.pdf');
									$_data['pathtofile'] = $_pathtoFile;
									$_data['display_name'] = 'Inventory : '.$report_o->stacknumber;
									$_data['mime'] = 'application/pdf';
									$_data['subject'] = 'Inventory : '.$report_o->stacknumber;
									$_data['recipients'] = array_filter(preg_split( "/[;,]/", $q['recipients'] ));

									$pdf->save($_pathtoFile);
									return $this->processMail($q,$_data);
								} else return $pdf->stream('INV-'.$report_o->stacknumber.'.pdf');
							} else {
								if($mail) return false;
								else $_404 = true;
							}
							break;

						case 'gross-profit-report':
							$report_o = $this->generateGrossProfitReport($q);
							if($report_o) { 
								$pdf = PDF::loadView('pdf.base',array('child' => View::make('reports.gross-profit-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.gross-profit-content', array('report_o' => $report_o))));
								if($mail) {
									$_pathtoFile = storage_path('queue/GP-'.date('Ymd').'.pdf');
									$_data['pathtofile'] = $_pathtoFile;
									$_data['display_name'] = 'Gross Profit Report : '.date('Ymd');
									$_data['mime'] = 'application/pdf';
									$_data['subject'] = 'Gross Profit Report : '.date('Ymd');
									$_data['recipients'] = array_filter(preg_split( "/[;,]/", $q['recipients'] ));

									$pdf->save($_pathtoFile);
									return $this->processMail($q,$_data);
								} else return $pdf->stream('GP-'.date('Ymd').'.pdf');
							} else {
								if($mail) return false;
								else $_404 = true;
							}
							break;

						case 'commission-statement':
							if(!$this->filterParams($q,array('filterId'))) { 
								if($mail) return false;
								else $_404 = true;
								break; 
							}

							$report_o = $this->generateCommissionStatement($q);
							if($report_o) { 
								$pdf = PDF::loadView('pdf.base',array('child' => View::make('reports.commission-header-pdf', array('report_o' => $report_o))->nest('_nest_content', 'reports.commission-content', array('report_o' => $report_o))));
								if($mail) {
									$_pathtoFile = storage_path('queue/COM-'.$report_o->user->lastname.' '.$report_o->user->firstname.' '.$report_o->user->suffix.'.pdf');
									$_data['pathtofile'] = $_pathtoFile;
									$_data['display_name'] = 'Commission Statement : '.$report_o->user->lastname.' '.$report_o->user->firstname.' '.$report_o->user->suffix;
									$_data['mime'] = 'application/pdf';
									$_data['subject'] = 'Commission Statement : '.$report_o->user->lastname.' '.$report_o->user->firstname.' '.$report_o->user->suffix;
									$_data['recipients'] = array_filter(preg_split( "/[;,]/", $q['recipients'] ));

									$pdf->save($_pathtoFile);
									return $this->processMail($q,$_data);
								} else return $pdf->stream('COM-'.$report_o->user->lastname.' '.$report_o->user->firstname.' '.$report_o->user->suffix.'.pdf');
							} else {
								if($mail) return false;
								else $_404 = true;
							}
							break;

						default:
							if($mail) return false;
							else $_404 = true;
							break;
					}
					break;

				case 'excel':
					if(!$this->filterParams($q,array('model'))) { 
						if($mail) return false;
						else $_404 = true;
						break; 
					}

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

						default:
							if($mail) return false;
							else $_404 = true;
							break;
					}
					break;

				default:
					if($mail) return false;
					else $_404 = true;
					break;
			}
		}

		if($_404) return Redirect::to('404')->withPage('file');
		exit();
	}

	public function report($q, $type){
		$_error = false;
		$_notfound = false;
		$report_o = array();
		switch($type){
			case Config::get('constants.REPORT_COMMISSION'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateCommissionStatement($q);
				if(!$report_o) { $_notfound = true; break; }
				break;

			case Config::get('constants.REPORT_CUSTOMER'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateCustomerStatement($q);
				if(!$report_o) { $_notfound = true; break; }
				break;

			case Config::get('constants.REPORT_DRIVER'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateDriversPay($q);
				if(!$report_o) { $_notfound = true; break; }
				break;

			case Config::get('constants.REPORT_GROSS_PROFIT'):
				$report_o = $this->generateGrossProfitReport($q);
				if(!$report_o) { $_notfound = true; break; }
				break;

			case Config::get('constants.REPORT_INVENTORY'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateInventoryReport($q);
				if(!$report_o) { $_notfound = true; break; }
				break;

			case Config::get('constants.REPORT_OPERATOR'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateOperatorStatement($q);
				if(!$report_o) { $_notfound = true; break; }
				break;

			case Config::get('constants.REPORT_PRODUCER'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateProducerStatement($q);
				if(!$report_o) { $_notfound = true; break; }
				break;

			case Config::get('constants.REPORT_TRUCKING'):
				if(!$this->filterParams($q,array('filterId'))) { $_error = true; break; }

				$report_o = $this->generateTruckingStatement($q);
				if(!$report_o) { $_notfound = true; break; }
				break;
		}

		if($_error) return App::abort(501,'Not implemented');
		if($_notfound) return App::abort(501,'Search not found. Please try again.');
		return Response::json($report_o);
	}

	public function fire($job, $_params){
		switch ($_params['process']) {
			case 'mail':
				if ($job->attempts() > 3) { $job->delete(); break; }
				$status = $this->download($_params,true);
				if(!$status) { $job->release(3); break; }
				break;
			
			default:
				$job->delete();
				break;
		}
	}

	private function processMail($data = array(), $_data = array()){
		Mail::send('emails.content', $data, function($message) use($_data) {
			$message->to($_data['recipients']);
			$message->subject($_data['subject']);
			$message->attach($_data['pathtofile'], array('as' => $_data['display_name'], 'mime' => $_data['mime']));
		});

		unlink($_data['pathtofile']);

		return true;
	}

	private function getOrderDetails($id){
		return Order::with('productsummary.productname')
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
					->find($id);
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

	private function generateCustomerStatement($_params = array()) {
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
	    					->with(array('productorder.transportscheduleproduct.transportschedule.weightticket' => function($query) use($_dateBetween) {
	    						$query->where('weightticket.status_id','=',Config::get('constants.STATUS_CLOSED'))
	                                ->whereBetween('weightticket.updated_at',array_values($_dateBetween))
	                                ->whereNotNull('weightticket.pickup_id')
	                                ->select(array('weightticket.id as wid','transportSchedule_id','weightTicketNumber','updated_at','pickup_id'));
	    					}))
                            ->where('order_id','=',$order_a['id'])
                            ->orderBy('products.name','ASC')
                            ->select(array('productordersummary.id','products.name as product','unitprice'))
                            ->get()
                            ->each(function($productordersummary){
                            	$productordersummary->productorder->each(function($productorder){
                            		$productorder->transportscheduleproduct->each(function($transportscheduleproduct) use($productorder) {
                            			$weightticketproduct_o = WeightTicketProducts::join('transportscheduleproduct','transportscheduleproduct.id','=','weightticketproducts.transportscheduleproduct_id')
                            										->where('weightticketproducts.transportscheduleproduct_id','=',$transportscheduleproduct->id)
                            										->where('weightticketproducts.weightticketscale_id','=',$transportscheduleproduct->transportschedule->weightticket->pickup_id)
                            										->where('transportscheduleproduct.productorder_id','=',$productorder->id)
                            										->select(array('bales','pounds'))
                            										->first();

										$transportscheduleproduct->bales = $weightticketproduct_o->bales;
										$transportscheduleproduct->pounds = $weightticketproduct_o->pounds;
										$transportscheduleproduct->tons = $weightticketproduct_o->tons;
										$transportscheduleproduct->weightTicketNumber = $transportscheduleproduct->transportschedule->weightticket->weightTicketNumber;
										$transportscheduleproduct->updated_at = $transportscheduleproduct->transportschedule->weightticket->updated_at;
										$transportscheduleproduct->wid = $transportscheduleproduct->transportschedule->weightticket->wid;

										$transportscheduleproduct->setVisible(array('bales','tons','pounds','weightTicketNumber','updated_at','wid'));
                            		});

                            		$productorder->setVisible(array('id','stacknumber','transportscheduleproduct'));
                            	});
                            })
                            ->toArray();

            foreach ($product_a as $product_key => $product) {
	            $productorder_a = array();
	            $_tons = 0.0000;
	            foreach ($product['productorder'] as $productorder_key => $productorder) {
	            	foreach ($productorder['transportscheduleproduct'] as $key => $weightticket) {
		                if(array_key_exists($weightticket['wid'], $productorder_a)) {
		                    $productorder_a[$weightticket['wid']]['bales'] = bcadd($productorder_a[$weightticket['wid']]['bales'],$weightticket['bales'],0);
		                    $productorder_a[$weightticket['wid']]['pounds'] = bcadd($productorder_a[$weightticket['wid']]['pounds'],$weightticket['pounds'],2);
		                    $productorder_a[$weightticket['wid']]['tons'] = bcadd($productorder_a[$weightticket['wid']]['tons'],$weightticket['tons'],4);
	                    	$_tons = bcadd($_tons,$weightticket['tons'],4);
		                } else {
		                    $productorder_a[$weightticket['wid']] = $weightticket;
		                    $_tons += $weightticket['tons'];
		                }
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
	                        $truck->hauling = 0.00;
	                        $truck->adminfee = 0.00;
	                        $truck->loadingfee = 0.00;
	                        $truck->fuelcharge = 0.00;
	                        $truck->trailerrent = 0.00;
	                        $truck->bales = 0;
	                        $truck->pounds = 0.00;
	                        $truck->tons = 0.0000;
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
	                                	'transportschedule.adminfee',
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
	                                        $pickup_net = bcsub($transportschedule->weightticket->weightticketscale_pickup->gross,$transportschedule->weightticket->weightticketscale_pickup->tare,4);
	                                        $dropoff_net = bcsub($transportschedule->weightticket->weightticketscale_dropoff->gross,$transportschedule->weightticket->weightticketscale_dropoff->tare,4);
	                                        $ii = bccomp($pickup_net,$dropoff_net,4);
	                                        switch ($ii) {
	                                            case -1:
	                                                $transportschedule->bales = $transportschedule->weightticket->weightticketscale_pickup->bales;
	                                                $transportschedule->tons = $pickup_net;
	                                                $transportschedule->pounds = bcmul($transportschedule->tons,2000,2);
	                                                unset($transportschedule->weightticket);
	                                                break;

	                                            case 1:
	                                            case 0:
	                                            default:
	                                            	$transportschedule->bales = $transportschedule->weightticket->weightticketscale_dropoff->bales;
	                                                $transportschedule->tons = $dropoff_net;
	                                                $transportschedule->pounds = bcmul($transportschedule->tons,2000,2);
	                                                unset($transportschedule->weightticket);
	                                                break;
	                                        }
	                                    } else if(
	                                            !is_null($transportschedule->weightticket->weightticketscale_pickup) && 
	                                            is_null($transportschedule->weightticket->weightticketscale_dropoff
	                                        )) {
	                                        $transportschedule->bales = $transportschedule->weightticket->weightticketscale_pickup->bales;
	                                        $transportschedule->tons = bcsub($transportschedule->weightticket->weightticketscale_pickup->gross,$transportschedule->weightticket->weightticketscale_pickup->tare,4);
	                                        $transportschedule->pounds = bcmul($transportschedule->tons,2000,2);
	                                        unset($transportschedule->weightticket);
	                                    } else {
	                                        $transportschedule->bales = $transportschedule->weightticket->weightticketscale_dropoff->bales;
	                                        $transportschedule->tons = bcsub($transportschedule->weightticket->weightticketscale_dropoff->gross,$transportschedule->weightticket->weightticketscale_dropoff->tare,4);
	                                        $transportschedule->pounds = bcmul($transportschedule->tons,2000,2);
	                                        unset($transportschedule->weightticket);
	                                    }

	                                    $transportschedule->gross = bcmul($transportschedule->tons, $transportschedule->truckingrate,2);
	                                    $transportschedule->amount = bcsub(bcsub(bcsub(bcadd($transportschedule->gross, $transportschedule->fuelcharge,2),$transportschedule->trailerrate,2),bcadd($transportschedule->originloaderfee,$transportschedule->destinationloaderfee,2),2),$transportschedule->adminfee,2);

	                                    $truck->hauling = bcadd($truck->hauling,$transportschedule->gross,2);
	                                    $truck->adminfee = bcadd($truck->adminfee,$transportschedule->adminfee,2);
	                                    $truck->loadingfee = bcadd($truck->loadingfee,bcadd($transportschedule->originloaderfee,$transportschedule->destinationloaderfee,2),2);
	                                    $truck->fuelcharge = bcadd($truck->fuelcharge,$transportschedule->fuelcharge,2);
	                                    $truck->trailerrent = bcadd($truck->trailerrent,$transportschedule->trailerrate,2);
	                                    $truck->bales = bcadd($truck->bales, $transportschedule->bales,0);
	                                    $truck->tons = bcadd($truck->tons, $transportschedule->tons,4);
	                                    $truck->pounds = bcmul($truck->tons, 2000,2);
	                                    $truck->amount = bcadd($truck->amount,$transportschedule->amount,2);
	                                })->toArray();
	                        });
	                    })->shift();
		if(!$report_o) return false;
		return $this->parse($report_o->toArray());
	}

	private function generateOperatorStatement($_params = array()){
		$_dateBetween = $this->generateBetweenDates($_params);
		$report_o = Contact::join('account','account.id','=','account')
                    ->with(array('order' => function($query) use($_dateBetween) {
                        $query->join('account','account.id','=','order.account_id')
                        	->whereBetween('transportschedule.updated_at',array_values($_dateBetween))
                            ->select(array('trucker_id','order.id as id','order.order_number','account.name as account'))
                            ->where('transportschedule.status_id','=',Config::get('constants.STATUS_CLOSED'))
                            ->where('transportschedule.truckeraccounttype_id','=',Config::get('constants.ACCOUNTTYPE_OPERATOR'))
                            ->orderBy('order.created_at','desc');
                    }))
                    ->where('contact.id','=',$_params['filterId'])
                    ->select(array('contact.id','contact.firstname','contact.lastname','contact.suffix','account.name as account','contact.email','contact.phone'))
                    ->take(1)
                    ->get()
                    ->each(function($trucker) use($_dateBetween) {
                        $trucker->amount = 0.00;
                        $trucker->report_date = (object) $_dateBetween;
                        $trucker->order->each(function($order) use($trucker,$_dateBetween) {
                            $order->transportschedule = TransportSchedule::with('originloader')
                                ->with('destinationloader')
                                ->join('weightticket','weightticket.transportschedule_id','=','transportschedule.id')
                                ->select(array('transportschedule.id','transportschedule.originloader_id','transportschedule.originloaderfee','transportschedule.destinationloader_id','transportschedule.destinationloaderfee','transportschedule.updated_at','weightticket.weightticketnumber'))
                                ->where('transportschedule.order_id','=',$order->id)
                                ->where('transportschedule.trucker_id','=',$order->trucker_id)
                                ->where('transportschedule.truckerAccountType_id','=',Config::get('constants.ACCOUNTTYPE_OPERATOR'))
                                ->where('transportschedule.status_id','=',Config::get('constants.STATUS_CLOSED'))
                                ->whereBetween('transportschedule.updated_at',array_values($_dateBetween))
                                ->orderBy('transportschedule.updated_at','desc')
                                ->get()
                                ->each(function($transportschedule) use($trucker) {
                                    $trucker->amount = bcadd(bcadd($trucker->amount,$transportschedule->originloaderfee,2),$transportschedule->destinationloaderfee,2);
                                })->toArray();
                        });
                    })->shift();

		if(!$report_o) return false;
		return $this->parse($report_o->toArray());
	}

	private function generateInventoryReport($_params = array()) {
		$_dateBetween = $this->generateBetweenDates($_params);

		$report_o = Stack::with('product')
						->with(array('inventory' => function($query) use($_dateBetween) {
							$query->join('inventory','inventory.id','=','inventoryproduct.inventory_id')
								->leftJoin('section as sectionfrom','sectionfrom.id','=','inventoryproduct.sectionfrom_id')
								->leftJoin('storagelocation as storagelocationfrom','storagelocationfrom.id','=','sectionfrom.storagelocation_id')
								->leftJoin('section as sectionto','sectionto.id','=','inventoryproduct.sectionto_id')
								->leftJoin('storagelocation as storagelocationto','storagelocationto.id','=','sectionto.storagelocation_id')
								->join('inventorytransactiontype','inventorytransactiontype.id','=','inventory.transactiontype_id')
								->leftJoin('order','order.id','=','inventory.order_id')
								->leftJoin('contract','contract.id','=','order.contract_id')
								->leftJoin('account','account.id','=','order.account_id')
								->leftJoin('order as returnOrder','returnOrder.id','=','inventory.returnedOrder_id')
								->leftJoin('weightticket','weightticket.id','=','inventory.weightticket_id')
								->whereBetween('inventoryproduct.created_at',array_values($_dateBetween))
								->orderBy('inventoryproduct.created_at','ASC')
								->select(array(
										'inventoryproduct.stack_id',
										'inventoryproduct.price',
										'inventoryproduct.bales',
										'inventoryproduct.tons',
										'inventoryproduct.updated_at',
										'inventorytransactiontype.id as transaction_id',
										'inventorytransactiontype.type as transaction_type',
										'inventorytransactiontype.operation as transaction_operation',
										'account.name as account',
										'order.order_number',
										'contract.contract_number',
										'returnOrder.order_number as order_return',
										'weightticket.weightticketnumber',
										DB::raw('CONCAT(storagelocationfrom.name, " - ", sectionfrom.name) AS location_from'),
										DB::raw('CONCAT(storagelocationto.name, " - ", sectionto.name) AS location_to'),
									));
						}))
						->select(array('id','stacknumber','product_id'))
						->where('id','=',$_params['filterId'])
						->first();

		if(!$report_o) return false;

		$report_o->bales_in = 0;
		$report_o->tons_in = 0.0000;
		$report_o->bales_out = 0;
		$report_o->tons_out = 0.0000;

		$report_o->inventory->each(function($inventory) use($report_o) {
			switch ($inventory->transaction_id) {
				case Config::get('constants.TRANSACTIONTYPE_SO'):
				case Config::get('constants.TRANSACTIONTYPE_ISSUE'):
					$report_o->bales_out = bcadd($report_o->bales_out, $inventory->bales,0);
					$report_o->tons_out = bcadd($report_o->tons_out, $inventory->tons,4);
					break;

				case Config::get('constants.TRANSACTIONTYPE_PO'):
				case Config::get('constants.TRANSACTIONTYPE_RECEIPT'):
					$report_o->bales_in = bcadd($report_o->bales_in, $inventory->bales,0);
					$report_o->tons_in = bcadd($report_o->tons_in, $inventory->tons,4);
					break;
			}
		});

		$report_o->report_date = (object) $_dateBetween;
        return $this->parse($report_o->toArray());
	}

	private function generateGrossProfitReport($_params = array()) {
		$_dateBetween = $this->generateBetweenDates($_params);

		global $report_a;
		$report_a['netsale'] = 0.00;
		$report_a['haycost'] = 0.00;
		$report_a['freight'] = 0.00;
		$report_a['fees'] = 0.00;
		$report_a['commission'] = 0.00;
		$report_a['profit'] = 0.00;

		$report_o = Order::join('account','account.id','=','order.account_id')
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
                                'account.name as account', 
                                'order_number'
                            ))
					->get()
					->each(function($order) use($_dateBetween,$report_a){
						global $report_a;
						$product_a = ProductOrderSummary::join('products','products.id','=','productordersummary.product_id')
				    					->with(array('productorder.transportscheduleproduct.transportschedule.weightticket' => function($query) use($_dateBetween) {
				    						$query->leftJoin('commission','commission.weightticket_id','=','weightticket.id')
				    							->join('weightticketscale as pickupscale','pickupscale.id','=','weightticket.pickup_id')
				    							->leftJoin('weightticketscale as dropscale','dropscale.id','=','weightticket.dropoff_id')
				    							->where('weightticket.status_id','=',Config::get('constants.STATUS_CLOSED'))
				                                ->whereBetween('weightticket.updated_at',array_values($_dateBetween))
				                                ->whereNotNull('weightticket.pickup_id')
				                                ->select(array(
					                                	'weightticket.id as wid',
					                                	'weightticket.transportSchedule_id',
					                                	'weightticket.weightTicketNumber',
					                                	'weightticket.updated_at',
					                                	'weightticket.pickup_id',
					                                	'pickupscale.fee as pickupscale_fee',
					                                	'dropscale.fee as dropscale_fee',
					                                	'commission.amountdue as commission'
				                                	));
				    					}))
			                            ->where('order_id','=',$order->id)
			                            ->orderBy('products.name','ASC')
			                            ->select(array('productordersummary.id','products.name as product','unitprice'))
			                            ->get()
			                            ->each(function($productordersummary){
			                            	$productordersummary->productorder->each(function($productorder){
			                            		$productorder->haycost = Stack::where('stacknumber','=',$productorder->stacknumber)->select(array('unitprice'))->first()->unitprice;
			                            		$productorder->transportscheduleproduct->each(function($transportscheduleproduct) use($productorder) {
			                            			$weightticketproduct_o = WeightTicketProducts::join('transportscheduleproduct','transportscheduleproduct.id','=','weightticketproducts.transportscheduleproduct_id')
			                            										->where('weightticketproducts.transportscheduleproduct_id','=',$transportscheduleproduct->id)
			                            										->where('weightticketproducts.weightticketscale_id','=',$transportscheduleproduct->transportschedule->weightticket->pickup_id)
			                            										->where('transportscheduleproduct.productorder_id','=',$productorder->id)
			                            										->select(array('bales','pounds'))
			                            										->first();

            										$transportscheduleproduct->wid = $transportscheduleproduct->transportschedule->weightticket->wid;
													$transportscheduleproduct->weightTicketNumber = $transportscheduleproduct->transportschedule->weightticket->weightTicketNumber;
													$transportscheduleproduct->updated_at = $transportscheduleproduct->transportschedule->weightticket->updated_at;
													$transportscheduleproduct->netsale = bcmul($weightticketproduct_o->tons, $productorder->unitprice,2);
													$transportscheduleproduct->haycost = bcmul($weightticketproduct_o->tons, $productorder->haycost,2);
													$transportscheduleproduct->freight = bcadd(bcadd($transportscheduleproduct->transportschedule->truckingrate, $transportscheduleproduct->transportschedule->trailerrate,2),bcadd($transportscheduleproduct->transportschedule->weightticket->pickupscale_fee,$transportscheduleproduct->transportschedule->weightticket->dropscale_fee,2),2);
													$transportscheduleproduct->fees = bcadd($transportscheduleproduct->transportschedule->originloaderfee,$transportscheduleproduct->transportschedule->destinationloaderfee,2);
													$transportscheduleproduct->commission = number_format($transportscheduleproduct->transportschedule->weightticket->commission,2,'.','');
													$transportscheduleproduct->profit = bcsub($transportscheduleproduct->netsale,$transportscheduleproduct->haycost,2);

													$transportscheduleproduct->setVisible(array(
																							'wid',
																							'weightTicketNumber',
																							'updated_at',
																							'netsale',
																							'haycost',
																							'freight',
																							'fees',
																							'commission',
																							'profit'
																						));
			                            		});

			                            		$productorder->setVisible(array('id','stacknumber','transportscheduleproduct'));
			                            	});
			                            })
			                            ->toArray();

                        foreach ($product_a as $product_key => $product) {
				            $productorder_a = array();
				            foreach ($product['productorder'] as $productorder_key => $productorder) {
				            	foreach ($productorder['transportscheduleproduct'] as $key => $weightticket) {
					                if(array_key_exists($weightticket['wid'], $productorder_a)) {
					                    $productorder_a[$weightticket['wid']]['netsale'] = bcadd($productorder_a[$weightticket['wid']]['netsale'],$weightticket['netsale'],2);
					                    $productorder_a[$weightticket['wid']]['haycost'] = bcadd($productorder_a[$weightticket['wid']]['haycost'],$weightticket['haycost'],2);
					                    $productorder_a[$weightticket['wid']]['profit'] = bcadd($productorder_a[$weightticket['wid']]['profit'],$weightticket['profit'],2);

					                    $report_a['netsale'] = bcadd($report_a['netsale'],$weightticket['netsale'],2);
					                    $report_a['haycost'] = bcadd($report_a['haycost'],$weightticket['haycost'],2);
					                    $report_a['profit'] = bcadd($report_a['profit'],$weightticket['profit'],2);
					                } else {
					                    $productorder_a[$weightticket['wid']] = $weightticket;
					                    $productorder_a[$weightticket['wid']]['profit'] = bcsub(bcsub(bcsub($weightticket['profit'],$weightticket['fees'],2),$weightticket['freight'],2),$weightticket['commission'],2);

					                    $report_a['netsale'] = bcadd($report_a['netsale'],$weightticket['netsale'],2);
					                    $report_a['haycost'] = bcadd($report_a['haycost'],$weightticket['haycost'],2);
					                    $report_a['fees'] = bcadd($report_a['fees'],$weightticket['fees'],2);
					                    $report_a['freight'] = bcadd($report_a['freight'],$weightticket['freight'],2);
					                    $report_a['commission'] = bcadd($report_a['commission'],$weightticket['commission'],2);
					                    $report_a['profit'] = bcsub(bcsub(bcsub(bcadd($report_a['profit'],$weightticket['profit'],2),$weightticket['fees'],2),$weightticket['freight'],2),$weightticket['commission'],2);
					                }

					                $productorder_a[$weightticket['wid']]['profit_percentage'] = bcmul(bcdiv($productorder_a[$weightticket['wid']]['profit'],$productorder_a[$weightticket['wid']]['netsale'],4),100,2);
					            }
				            }
				            $product_a[$product_key]['productorder'] = array_values($productorder_a);
				        }

				        $order->productsummary = $product_a;
					});

		if(!$report_o) return false;

		$report_a['profit_percentage'] = bcmul(bcdiv($report_a['profit'], $report_a['netsale'],4),100,2);
		$report_a['report_date'] = $_dateBetween;
		$report_a['orders'] = $report_o->toArray();
        return $this->parse($report_a);
	}

	private function generateCommissionStatement($_params = array()){
		$_dateBetween = $this->generateBetweenDates($_params);
		global $amount_i;
		$amount_i = 0.00;
		$report_o = Commission::with('order.account')
						->with('weightticket.weightticketscale_pickup')
						->with('weightticket.weightticketscale_dropoff')
						->where('user_id','=',$_params['filterId'])
						->whereBetween('updated_at',array_values($_dateBetween))
						->orderBy('updated_at','DESC')
						->get()
						->each(function($commission) use($amount_i) {
							global $amount_i;
							$commission->order_number = $commission->order->order_number;
							$commission->account = $commission->order->account->name;
							unset($commission->order);

							$commission->weightTicketNumber = $commission->weightticket->weightTicketNumber;
							if(!is_null($commission->weightticket->weightticketscale_dropoff)) {
								$commission->bales = $commission->weightticket->weightticketscale_dropoff->bales;
							} else {
								$commission->bales = $commission->weightticket->weightticketscale_pickup->bales;
							}

							$amount_i = bcadd($amount_i, $commission->amountdue,2);

							unset($commission->weightticket);
							unset($commission->weightticket_id);
							unset($commission->id);
							unset($commission->order_id);
							unset($commission->user_id);
							unset($commission->created_at);
						});
		if(!$report_o) return false;

		$report_a['user'] = User::select(array('firstname','lastname','suffix','email','emp_no'))->where('id','=',$_params['filterId'])->first()->toArray();
		$report_a['report_date'] = $_dateBetween;
		$report_a['commission'] = $report_o->toArray();
		$report_a['amount'] = $amount_i;
        return $this->parse($report_a);
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