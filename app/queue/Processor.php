<?php

class Processor {
	public function fire($job, $data)
	{
		switch ($data['process']) {
			case 'mail':
				switch ($data['model']) {
					case 'order':
						if ($job->attempts() > 3) { $job->delete(); break; }

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
									->find($data['model_id']);

						if(!$order) { $job->delete(); break; }
						
						$_pathtoFile = storage_path('queue/'.$order->order_number.'.pdf');
						$_data['pathtofile'] = $_pathtoFile;
						$_data['display_name'] = $order->order_number;
						$_data['order'] = $order;
						$_data['mime'] = 'application/pdf';
						$_data['subject'] = ( $order->isfrombid == 0 ? ( $order->ordertype == 1 ? 'Purchase Order': 'Sales Order' ) : 'Bid Details' ).':'. $order->order_number;
						$_data['recipients'] = array_filter(preg_split( "/[;,]/", $data['recipients'] ));

						PDF::loadView('pdf.base',array('child' => View::make('pdf.order',array('order'=>$order))))->save($_pathtoFile);
						Mail::send('emails.order', $data, function($message) use($_data) {
							$message->to($_data['recipients']);
							$message->subject($_data['subject']);
							$message->attach($_data['pathtofile'], array('as' => $_data['display_name'], 'mime' => $_data['mime']));
						});

						$job->delete();
						break;
					
					default:
						$job->delete();
						break;
				}
				break;
			
			default:
				$job->delete();
				break;
		}
	}
}