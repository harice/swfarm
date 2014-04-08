<?php

namespace APIv1;

use BaseController;
use BidRepositoryInterface;
use Input;
use Config;



class BidController extends BaseController {

	public function __construct(BidRepositoryInterface $bid)
	{
		$this->bid = $bid;
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		return $this->bid->paginate( Input::all() );
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		return $this->bid->store( Input::all() );
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return $this->bid->findById($id);
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
		//
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		return $this->bid->update($id, Input::all());
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		return $this->bid->destroy($id);
	}

	public function search()
	{
		return $this->bid->search( Input::all() );
	}

	public function getProducerAccount(){
		return $this->bid->getProducerAccount(Input::get('search'));
	}

	public function getProducerAddress(){
		return $this->bid->getProducerAddress(Input::get('producerId'));
	}

	public function getDestination(){
		return $this->bid->getDestination();
	}

	public function createPurchaseOrder(){
		return $this->bid->createPurchaseOrder(Input::all());
	}

	public function cancelPurchaseOrder($id){
		return $this->bid->cancelPurchaseOrder($id);
	}

	public function getPurchaseOrder(){
		return $this->bid->getPurchaseOrder(Input::all());
	}

	public function addPickupDateToPurchaseOrder($bidId){
		return $this->bid->addPickupDateToPurchaseOrder($bidId, Input::all());
	}

	public function addUnitPriceToBidProduct($bidId){
		return $this->bid->addUnitPriceToBidProduct($bidId, Input::all());
	}

	public function cancelBid($bidId){
		return $this->bid->cancelBid($bidId);
	}
}