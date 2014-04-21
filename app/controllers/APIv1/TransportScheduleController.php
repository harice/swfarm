<?php

namespace APIv1;

use BaseController;
use TransportScheduleRepositoryInterface;
use Input;
use Config;
use Response;


class TransportScheduleController extends BaseController {

	public function __construct(TransportScheduleRepositoryInterface $transportSchedule)
	{
		$this->transportSchedule = $transportSchedule;
	}
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		return $this->transportSchedule->paginate(Input::all());
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return $this->transportSchedule->getSchedule($id, Input::get('type'));
	}


	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		return $this->transportSchedule->addOrUpdateTransportSchedule(Input::all());
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($transportScheduleId)
	{
		return $this->transportSchedule->addOrUpdateTransportSchedule(Input::all(), $transportScheduleId);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		return $this->transportSchedule->deleteTransportSchedule($id);
	}

	public function getTruckerAccount(){
		return $this->transportSchedule->getTruckerAccount(Input::get('search'));
	}

	public function getLoaderAccount(){
		return $this->transportSchedule->getLoaderAccount(Input::get('search'));
	}

	public function getTruckingRate(){
		return Response::json(array(
			'truckingrate' => Config::get('constants.TRUCKING_RATE')),
	        200);
	}

}