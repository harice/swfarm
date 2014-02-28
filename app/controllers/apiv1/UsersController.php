<?php

namespace APIv1;

use BaseController;
use UsersRepositoryInterface;
use View;
use Input;

class UsersController extends BaseController {

	public function __construct(UsersRepositoryInterface $users){
		$this->users = $users;
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{	
		return $this->users->findAll();
		// return Response::json(array(
		// 	'error' => false,
		// 	'users' => $this->users->findAll())
		// );
        //return View::make('users.index');
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		return $this->users->store( Input::all() );
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
        return $this->users->findById($id);
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
        return View::make('users.edit');
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		return $this->users->update($id, Input::all());
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		return $this->users->destroy($id);
	}

	public function paginate($perPage = 2, $offest = 0){
		return $this->users->paginate($perPage, $offest);
	}

}
