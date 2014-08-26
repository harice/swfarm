<?php

class FileController extends BaseController 
{
	public function __construct(DownloadInterface $repo)
    {
        $this->repo = $repo;
    }

	public function index()
	{	
		return $this->repo->download(Input::all());
	}

	public function missingMethod($parameters = array())
	{
	    return Response::view('errors.404', $parameters, 404);
	}

}
