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
    
	public function getPurchaseOrders()
	{
		$collection = $this->repo->getAllOrders( Input::all() );
        return Response::json($collection);
	}

	public function getSalesOrders()
	{
		$collection = $this->repo->getAllOrders( Input::all(), 2);
        return Response::json($collection);
	}

	public function addPurchaseOrder()
	{
		$model = $this->repo->addOrder(Input::all());
        return Response::json($model);
	}

	public function addSalesOrder()
	{
		$model = $this->repo->addOrder(Input::all(), 2); //2 for SO
        return Response::json($model);
	}

	public function updatePurchaseOrder($id)
	{
		$model = $this->repo->updateOrder($id, Input::all());
        return Response::json($model);
	}

	public function updateSalesOrder($id)
	{
		$model = $this->repo->updateOrder($id, Input::all(), 2);
        return Response::json($model);
	}


	public function getPurchaseOrder($id)
	{
		$model = $this->repo->getOrder($id);
        return Response::json($model);
	}

	public function getSalesOrder($id)
	{
		$model = $this->repo->getOrder($id, 2);
        return Response::json($model);
	}

	
	public function destroy($id)
	{
		$model = $this->repo->deleteOrder($id);
		return Response::json($model);
	}
    
    
    public function cancelOrder($id)
    {
        $model = $this->repo->cancelOrder($id);
    	return Response::json($model);
    }
    
    public function close($id)
    {
        // $this->repo->close($id);
    }

    public function getPOStatus(){
    	$model = $this->repo->getPOStatus();
    	return Response::json($model);
    }

    public function getSOStatus(){
    	$model = $this->repo->getSOStatus();
    	return Response::json($model);
    }

    public function getDestinationList(){
    	$model = $this->repo->getOrderDestination();
    	return Response::json($model);
    }

    public function getPickupLocationList(){
    	$model = $this->repo->getOrderPickupLocation();
    	return Response::json($model);
    }

    public function getNatureOfSaleList(){
    	$model = $this->repo->getNatureOfSaleList();
    	return Response::json($model);
    }


}