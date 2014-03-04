<?php

namespace APIv1;

use BaseController;
use RolesRepositoryInterface;
use View;
use Input;
use Config;

class RolesController extends BaseController {

	public function __construct(RolesRepositoryInterface $roles)
	{
		$this->roles = $roles;
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		$perPage = Input::get('perpage', Config::get('constants.ROLES_PER_LIST')); //default to 10 items, see app/config/constants
		$page = Input::get('page', '1'); //default to page 1
		$offset = $page*$perPage-$perPage;
		
		return $this->roles->paginate($perPage, $offset);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		return $this->roles->store( Input::all() );
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return $this->roles->findById($id);
	}


	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		return $this->roles->update($id, Input::all());
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