<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use SettingsRepositoryInterface;
use Input;
use Illuminate\Support\Facades\Log;

class SettingsController extends BaseController {

    public function __construct(SettingsRepositoryInterface $repo)
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
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		 $response = $this->repo->store(Input::all());
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

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		 return $this->repo->update($id, Input::all());
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

    /**
     * Get Transport settings
     *
     * @return Response
     */
	public function getTransportSettings(){
		$response = $this->repo->getTransportSettings();
        return Response::json($response);
	}

    public function bulkUpdateSettings()
    {
        return $this->repo->updateSettings(Input::all());
    }

}
