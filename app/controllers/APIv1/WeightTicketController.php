<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use WeightTicketRepositoryInterface;
use Input;

class WeightTicketController extends BaseController {

    public function __construct(WeightTicketRepositoryInterface $weightticket) {
        $this->weightticket = $weightticket;
    }
    
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		// $collection = $this->weightticket->findAll();
  //       return Response::json($collection);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		$model = $this->weightticket->store(Input::all());
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
		$model = $this->weightticket->findById($id);
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
		$model = $this->weightticket->update($id, Input::all());
        return Response::json($model);
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($transportSchedule_id)
	{
		$model = $this->weightticket->destroy($transportSchedule_id);
		return Response::json($model);
	}

	public function getScheduleProducts(){
		$model = $this->weightticket->getScheduleProducts(Input::get('transportschedule_id'));
        return Response::json($model);
	}


}