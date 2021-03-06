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
        if(isset($model['error'])){
            if($model['error']){
                return Response::json($model, 500);
            } else {
                return Response::json($model);    
            }
        } else {
            return Response::json($model);    
        }
        
	}

	public function addSalesOrder()
	{
		$model = $this->repo->addOrder(Input::all(), 2); //2 for SO
        if(isset($model['error'])){
            if($model['error']){
                return Response::json($model, 500);
            } else {
                return Response::json($model);    
            }
        } else {
            return Response::json($model);    
        }
	}

	public function updatePurchaseOrder($id)
	{
		$model = $this->repo->updateOrder($id, Input::all());
        if(isset($model['error'])){
            if($model['error']){
                return Response::json($model, 500);
            } else {
                return Response::json($model);    
            }
        } else {
            return Response::json($model);    
        }
	}

	public function updateSalesOrder($id)
	{
		$model = $this->repo->updateOrder($id, Input::all(), 2);
        if(isset($model['error'])){
            if($model['error']){
                return Response::json($model, 500);
            } else {
                return Response::json($model);    
            }
        } else {
            return Response::json($model);    
        }
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
        $model = $this->repo->cancelOrder($id, Input::all());
        if($model['error']){
            $status = 500; //if has error
        } else {
            $status = 200;
        }
    	return Response::json($model, $status);
    }
    
    public function closeOrder($id)
    {
        $model = $this->repo->closeOrder($id);
        if($model['error']){
            $status = 500; //if has error
        } else {
            $status = 200;
        }
        return Response::json($model, $status);
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

    public function getPOCancellingReasonList(){
        $model = $this->repo->getPOCancellingReasonList();
        return Response::json($model);
    }

    public function getSOCancellingReasonList(){
        $model = $this->repo->getSOCancellingReasonList();
        return Response::json($model);
    }

    public function getNatureOfSaleList(){
    	$model = $this->repo->getNatureOfSaleList();
    	return Response::json($model);
    }

    public function uploadFileToProductOrder(){
        $model = $this->repo->uploadFile(Input::all(), 'productorder');
        return Response::json($model);
    }

    public function getOrderWeightDetailsByStack(){
        $model = $this->repo->getOrderWeightDetailsByStack(Input::get('order_id'));
        return Response::json($model);
    }

    public function getPurchaseOrderProductsForSalesOrder(){
        $model = $this->repo->getPurchaseOrderProductsForSalesOrder( Input::get('order_id') );
        return Response::json($model);
    }

    public function checkInDropshipOrderProducts(){
        $model = $this->repo->checkInPurchaseOrderProducts(Input::get('order_id'));
        return Response::json($model);
    }

    public function checkInProducerOrderProducts(){
        $model = $this->repo->checkInPurchaseOrderProducts(Input::get('order_id'), false);
        return Response::json($model);
    }

    public function getSalesOrderUsingAccountId(){
        $model = $this->repo->getSalesOrderUsingAccountId(Input::get('accountId'));
        return Response::json($model);
    }


}