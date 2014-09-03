<?php

class DownloadRepository implements DownloadInterface 
{
	public function download($params)
	{
		$q = unserialize(base64_decode($params['q']));
		
		if(!is_array($q) && !array_key_exists('type', $q) && !array_key_exists('id', $q)) 
			return Redirect::to('404')->withPage('file');

		switch ($q['type']) {
			case 'doc':
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
		        }
				break;

			case 'pdf':
				if(!array_key_exists('model', $q)) break;
				switch ($q['model']) {
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
									->find($q['id']);
						
						return PDF::loadView('pdf.base',array('child' => View::make('pdf.order',array('order'=>$order) ) ) )->stream($order->order_number.'.pdf');
						break;
				}
				break;
		}

		return Redirect::to('404')->withPage('file');
	}
}