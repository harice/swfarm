<?php

class FileController extends BaseController 
{
	public function __construct(DownloadInterface $repo)
    {
        $this->repo = $repo;
    }

	public function index()
	{	
		return $this->repo->download(Input::all(),false);
	}

	public function missingMethod($parameters = array())
	{
	    return Redirect::to('404')->withParameters($parameters);
	}

}
