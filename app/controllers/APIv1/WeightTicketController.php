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
		$collection = $this->weightticket->findAll();
        return Response::json($collection);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		$this->weightticket->store(Input::all());
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
		return $this->weightticket->update($id, Input::all());
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		$this->weightticket->destroy($id);
	}

}