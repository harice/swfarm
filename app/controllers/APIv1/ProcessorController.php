<?php

namespace APIv1;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Response;
use BaseController;
use Input;
use DownloadInterface;

class ProcessorController extends BaseController 
{
	public function __construct(DownloadInterface $download)
	{
		$this->download = $download;
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		if(Input::has('process')) {
			Queue::push(get_class($this->download), Input::all());
			return Response::json(array( 'error' => false, 'message' => "Your request has been queued."), 200);
		} else {
			if(Request::ajax()) return App::abort(501,'Not implemented');
			else return Redirect::to('404')->withParameters($parameters);
		}
	}

	public function missingMethod($parameters = array())
	{
	    return Redirect::to('404')->withParameters($parameters);
	}


}
