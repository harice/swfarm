<?php

namespace APIv1;

use Illuminate\Support\Facades\Queue;
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
		return Queue::push('Processor', Input::all());
	}

	public function missingMethod($parameters = array())
	{
	    return Redirect::to('404')->withParameters($parameters);
	}


}
