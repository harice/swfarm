<?php

namespace APIv1;

use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Response;
use BaseController;
use Input;

class ProcessorController extends BaseController 
{
	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		if(Input::has('process') && Input::has('model') && Input::has('model_id')) {
			Queue::push('Processor', Input::only('process','model','model_id','recipients','extra_msg'));
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
