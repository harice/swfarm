<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use SalesOrderRepositoryInterface;
use Input;

class SalesOrderController extends BaseController {

    public function __construct(SalesOrderRepositoryInterface $repo) {
        $this->repo = $repo;
    }
    
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		$collection = $this->repo->findAll();
        return Response::json($collection);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		$model = $this->repo->store(Input::all());
        return Response::json($model);
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
		$model = $this->repo->update($id, Input::all());
        return Response::json($model);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		$this->repo->destroy($id);
	}
    
    public function getOrigin()
    {
        return $this->repo->getOrigin();
    }
    
    public function getNatureOfSale()
    {
        return $this->repo->getNatureOfSale();
    }
    
    public function cancel($id)
    {
        $this->repo->cancel($id);
    }
    
    public function close($id)
    {
        $this->repo->close($id);
    }

}