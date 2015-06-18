<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use DocumentRepositoryInterface;
use Input;

/**
 * Description of DocumentController
 *
 * @author Das
 */

class DocumentController extends BaseController {
    
    public function __construct(DocumentRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        // $result = $this->repo->findAll( Input::all() );
        // return Response::json($result);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		$response = $this->repo->uploadDocument( Input::all() );
        return Response::json($response);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
        $response = $this->repo->displayDocument($id);
        return Response::json($response);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		// $response = $this->repo->update($id, Input::all());
  //       return Response::json($response);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		// $response = $this->repo->destroy($id);
  //       return Response::json($response);
	}

	public function documentsCleanUp(){
		$this->repo->documentsCleanUp();
	}


}
