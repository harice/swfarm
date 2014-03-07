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
		//return $this->users->findAll();
		$perPage = Input::get('perpage', Config::get('constants.USERS_PER_LIST')); //default to 10 items, see app/config/constants
		$page = Input::get('page', '1'); //default to page 1
		$sortby = Input::get('sortby', 'lastname'); //default sort to lastname
		$orderby = Input::get('orderby', 'ASC'); //default order is Ascending
		$offset = $page*$perPage-$perPage;
		
		return $this->users->paginate($perPage, $offset, $sortby, $orderby);
		
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


}
