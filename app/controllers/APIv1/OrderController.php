<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use OrderRepositoryInterface;
use Input;

class OrderController extends BaseController {

    public function __construct(OrderRepositoryInterface $repo) {
        $this->repo = $repo;
    }
    
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		$collection = $this->repo->getAllOrders( Input::all() );
        return Response::json($collection);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function addPurchaseOrder()
	{
		$model = $this->repo->addOrder(Input::all());
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
		// $model = $this->repo->findById($id);
  //       return Response::json($model);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function updatePurchaseOrder($id)
	{
		$model = $this->repo->updateOrder($id, Input::all());
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
		// $this->repo->destroy($id);
	}
    
    public function getOrigin()
    {
        // return $this->repo->getOrigin();
    }
    
    public function getNatureOfSale()
    {
        // return $this->repo->getNatureOfSale();
    }
    
    public function cancel($id)
    {
        // $this->repo->cancel($id);
    }
    
    public function close($id)
    {
        // $this->repo->close($id);
    }

    public function getStatusList(){
    	$model = $this->repo->getStatusList();
    	return Response::json($model);
    }

    public function getDestinationList(){
    	$model = $this->repo->getOrderDestination();
    	return Response::json($model);
    }

    public function getNatureOfSaleList(){
    	$model = $this->repo->getNatureOfSaleList();
    	return Response::json($model);
    }

}