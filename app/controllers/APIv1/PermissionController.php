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
		return $this->permission->getAllRoleWithPermission();
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
	public function show($roleId)
	{
		return $this->permission->getPermissionByRoleId($roleId);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		return $this->permission->update($id, Input::all());
	}


	public function getAllPermissionCategoryType(){
		return $this->permission->getAllPermissionCategoryType();
	}
}