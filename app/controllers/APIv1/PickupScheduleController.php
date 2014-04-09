<?php

namespace APIv1;

use BaseController;
use PickupScheduleRepositoryInterface;
use Input;
use Config;


class PickupScheduleController extends BaseController {

	public function __construct(PickupScheduleRepositoryInterface $pickupSchedule)
	{
		$this->pickupSchedule = $pickupSchedule;
	}
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		return $this->pickupSchedule->paginate(Input::all());
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return $this->pickupSchedule->findById($id);
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		return $this->pickupSchedule->addOrUpdatePickupSchedule(Input::all());
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($pickupScheduleId)
	{
		return $this->pickupSchedule->addOrUpdatePickupSchedule(Input::all(), $pickupScheduleId);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		return $this->pickupSchedule->deletePickupSchedule($id);
	}

	public function getTruckerAccount(){
		return $this->pickupSchedule->getTruckerAccount(Input::get('search'));
	}

	public function getLoaderAccount(){
		return $this->pickupSchedule->getLoaderAccount(Input::get('search'));
	}

}