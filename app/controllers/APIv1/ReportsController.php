<?php

namespace APIv1;

use BaseController;
use DownloadInterface;
use Input;

class ReportsController extends BaseController {

	public function __construct(DownloadInterface $repo)
    {
        $this->repo = $repo;
    }

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return $this->repo->report(Input::all(),$id);
	}

	public function missingMethod($parameters = array())
	{
	    return App::abort(501,'Not implemented');
	}

}
