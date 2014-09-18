<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use ContractRepositoryInterface;
use Input;

class ContractController extends BaseController {

	public function __construct(ContractRepositoryInterface $repo)
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
        return $this->repo->findAll( Input::all() );
	}

    /**
	 * Search for a specfic record.
	 *
	 * @return Response
	 */
	public function search()
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
		return $this->repo->store(Input::all());
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
     * Update status
     *
     * @param type $id
     * @return type
     */
    public function closeContract($id)
    {
        $data['status_id'] = 2;
        $response = $this->repo->updateStatus($id, $data);
        return Response::json($response);
    }

    /**
     * Update status
     *
     * @param type $id
     * @return type
     */
    public function openContract($id)
    {
        $data['status_id'] = 1;
        $response = $this->repo->updateStatus($id, $data);
        return Response::json($response);
    }

    /**
     * Get Sales Orders by Product ID
     *
     * @param type $id Product ID
     * @return Response
     */
    public function salesorder($id)
    {
        return $this->repo->salesorder($id);
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
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function products($id)
	{
        $response = $this->repo->products($id);
        return Response::json($response);
	}

    /**
	 * Get Weight Tickets of this Contract.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function weighttickets($id)
	{
        $response = $this->repo->weighttickets($id);
        return Response::json($response);
	}

}
