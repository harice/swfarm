<?php

class DownloadRepository implements DownloadInterface 
{
	public function download($params)
	{
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
		
		// http://swfarm.local/file?q=YTozOntzOjE6ImkiO3M6MToiMSI7czoxOiJ0IjtzOjE6InYiO3M6MToibSI7czozOiJkb2MiO30=
		return Redirect::to('404')->withPage('file');
	}
}