<?php

namespace APIv1;

use BaseController;
use UsersRepositoryInterface;
use View;
use Input;
use Config;


class UsersController extends BaseController {

	public function __construct(UsersRepositoryInterface $users)
	{
		$this->users = $users;
	}

	public function search()
	{
		return $this->users->search( Input::all() );
	}

	public function auth()
	{
		return $this->users->auth();
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{		
		return $this->users->paginate( Input::all() );
		
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

	public function verifyAccount(){
		return $this->users->verifyAccount(Input::get('passkey'));
	}

	public function updateProfile($id){
		return $this->users->updateProfile($id, Input::all() );
	}

	public function userList(){
		return $this->users->userList(Input::all());	
	}


}
