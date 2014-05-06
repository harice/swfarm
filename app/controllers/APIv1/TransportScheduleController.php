<?php

namespace APIv1;

use BaseController;
use TransportScheduleRepositoryInterface;
use Input;
use Config;
use Response;


class TransportScheduleController extends BaseController {

	public function __construct(TransportScheduleRepositoryInterface $repo)
	{
		$this->repo = $repo;
	}

	public function index(){}
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function getAllPickupSchedules()
	{
		$collection = $this->repo->getAllTransportSchedules( Input::all() );
        return Response::json($collection);
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function getPickupSchedule($id)
	{
		$collection = $this->repo->getSchedule($id);
        return Response::json($collection);
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		$collection = $this->repo->addOrUpdateTransportSchedule(Input::all());
        return Response::json($collection);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($transportScheduleId)
	{
		$collection = $this->repo->addOrUpdateTransportSchedule(Input::all(), $transportScheduleId);
        return Response::json($collection);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		return $this->repo->deleteTransportSchedule($id);
	}

	public function getLoaderAccount(){
		return $this->repo->getLoaderAccount(Input::get('search'));
	}

	public function getTruckingRate(){
		return Response::json(array(
			'truckingrate' => Config::get('constants.TRUCKING_RATE')),
	        200);
	}

	public function getProductsOfOrder(){
		$model = $this->repo->getProductsOfOrder(Input::get('orderId'));
        return Response::json($model);
	}

	public function getTrailerList(){
		$model = $this->repo->getTrailerList();
        return Response::json($model);
	}

}