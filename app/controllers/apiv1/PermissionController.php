<?php
namespace APIv1;

use BaseController;
use PermissionRepositoryInterface;
use View;
use Input;
use Config;

class PermissionController extends BaseController {

	public function __construct(PermissionRepositoryInterface $permission)
	{
		$this->permission = $permission;
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		
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
		return $this->permission->store(Input::all());
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

	public function getAllPermissionCategoryType(){
		return $this->permission->getAllPermissionCategoryType();
	}

	public function getPermissionByRoleId(){
		$roleId = Input::get('roleId', 0); //default to page 1
		return $this->permission->getPermissionByRoleId($roleId);
	}

}