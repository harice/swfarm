<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use StorageLocationRepositoryInterface;
use Input;

/**
 * Description of StorageController
 *
 * @author Avs
 */

class StorageLocationController extends BaseController {
    
    public function __construct(StorageLocationRepositoryInterface $repo)
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
        $result = $this->repo->findAll( Input::all() );
        return Response::json($result);
	}
    
    /**
	 * Search for a specfic record.
	 *
	 * @return Response
	 */
	public function search()
	{
        $result = $this->repo->search( Input::all() );
        return Response::json($result);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		$response = $this->repo->store( Input::all() );
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
        $model = $this->repo->findById($id);
        return Response::json($model);
	}

	public function getStorageLocationByAccount($accountId)
	{
        $model = $this->repo->getStorageLocationByAccount($accountId);
        return Response::json($model);
	}

	public function getStorageLocationOfWarehouse(){
		$model = $this->repo->getStorageLocationOfWarehouse();
        return Response::json($model);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		$response = $this->repo->update($id, Input::all());
        return $response;
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		$response = $this->repo->destroy($id);
        return Response::json($response);
	}

	public function locationList(){
		$response = $this->repo->getAllStorageLocation();
        return Response::json($response);
	}

}
