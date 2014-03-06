<?php

namespace APIv1;

use BaseController;
use AuditRepositoryInterface;
use View;
use Input;
use Config;

class AuditController extends BaseController {

  public function __construct(AuditRepositoryInterface $audit)
	{
		$this->audit = $audit;
	}
  
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
    $perPage = Input::get('perpage', Config::get('constants.GLOBAL_PER_LIST')); //default to 10 items, see app/config/constants
		$page = Input::get('page', 1); //default to page 1
		$offset = $page*$perPage-$perPage;
		
		return $this->audit->paginate($perPage, $offset, $sortby = 'created_at', $orderby = 'desc');
	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
		//
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		//
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		//
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
		//
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		//
	}

}