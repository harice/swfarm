<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use PaymentRepositoryInterface;
use Input;

/**
 * Description of PaymentController
 *
 * @author Avs
 */

class PaymentController extends BaseController {
    
    public function __construct(PaymentRepositoryInterface $repo)
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
		$response = $this->repo->update($id, Input::all());
        return Response::json($response);
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

	public function cancel($id)
	{
		$response = $this->repo->cancel($id);
        return Response::json($response);
	}

	public function getAllPurchaseOrderList(){
		$response = $this->repo->getAllPurchaseOrderList(Input::all());
        return Response::json($response);
	}

	public function paymentListOfOrder(){
		$response = $this->repo->paymentListOfOrder(Input::get('orderId'));
        return Response::json($response);
	}

	// public function getAllClosedWeightTicketByUser(){
	// 	$response = $this->repo->getAllClosedWeightTicketByUser(Input::get('userId'));
 //        return Response::json($response);
	// }

	// public function getClosedWeightTicketById(){
	// 	$response = $this->repo->getClosedWeightTicketById(Input::get('weightticketId'));
 //        return Response::json($response);
	// }

	// public function getAllClosedWeightTicketByUserIncludingWithCommission(){
	// 	$response = $this->repo->getAllClosedWeightTicketByUser(Input::get('userId'), true);
 //        return Response::json($response);
	// }

}
