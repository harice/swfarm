<?php

class DownloadRepository implements DownloadInterface 
{
	public function download($params)
	{
		if(is_array($params) && array_key_exists('q', $params)) {
			// var_dump(Request::header());
			// var_dump(Cookie::get('laravel_session'));
			// var_dump(Session::all());
			// exit();
			$q = unserialize(base64_decode($params['q']));
			switch ($q['m']) {
				case 'doc':
					$file_o = Document::where('issave', '=', 1)->where('id', '=', $q['i'])->first();
			        if($file_o){
		        		header('Pragma: public');
            			header('Expires: 0');
            			header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
			        	header('Content-Description: File Transfer');
			        	header('Content-Transfer-Encoding: binary');
						
						// header('Content-Disposition: attachment; filename="downloaded.pdf"');

			            header('Content-Type: '.$file_o->type);
			            readfile($file_o->content);
			        }
					break;
			}
		}
		
		// return App::abort(501,'Not implemented');
		return Response::view('errors.404', array(), 404);
	}
}