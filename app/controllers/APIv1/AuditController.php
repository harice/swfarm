<?php

namespace APIv1;

use BaseController;
use AuditRepositoryInterface;
use View;
use Input;
use Config;

class AuditController extends BaseController {

  public function __construct(AuditRepositoryInterface $audit)
	{
		$this->audit = $audit;
	}
  
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        return $this->audit->paginate(Input::get());
	}

	public function missingMethod($parameters = array())
	{
	    if(Request::ajax()) return App::abort(501,'Not implemented');
		else return Redirect::to('404')->withParameters($parameters);
	}

}
