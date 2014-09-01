<?php

class Processor {
	public function fire($job, $data)
	{
		switch ($data['process']) {
			case 'mail':
				switch ($data['model']) {
					case 'order':
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

						return PDF::loadView('pdf.base',array('child' => View::make('pdf.order',array('order'=>$order) ) ) )->stream($order->order_number.'.pdf');
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