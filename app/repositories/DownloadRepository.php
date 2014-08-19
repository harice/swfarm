<?php

class DownloadRepository implements DownloadInterface 
{
	public function download($params)
	{
		if(Request::ajax()) return App::abort(501,'Not implemented');

		if(is_array($params) && array_key_exists('dl', $params)) {
			$dl = unserialize(base64_decode($params['dl']));
			switch ($dl['m']) {
				case 'document':
					$file = Document::where('issave', '=', 1)->where('id', '=', $dl['i'])->first();
			        if($file){
			            header('Content-Type: '.$file->type);
			            readfile($file->content);
			        }
					break;
			}
		}
		
		return Response::view('errors.404', array(), 404);
	}
}