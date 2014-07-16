<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use InventoryRepositoryInterface;
use Input;

/**
 * Description of InventoryController
 *
 * @author Avs
 */

class InventoryController extends BaseController {
    
    public function __construct(InventoryRepositoryInterface $repo)
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

	public function transactionType(){
		$response = $this->repo->getInventoryTransactionType();
        return Response::json($response);
	}

	public function stackList(){
		$response = $this->repo->getStackList(Input::get('stacknumber'));
        return Response::json($response);
	}

}
