<?php

namespace APIv1;

use BaseController;
use AccountRepositoryInterface;
use Input;
use Config;


class AccountController extends BaseController {

	public function __construct(AccountRepositoryInterface $account)
	{
		$this->account = $account;
	}
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		return $this->account->paginate( Input::all() );
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{ 
		return $this->account->store( Input::all() );
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return $this->account->findById($id);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		return $this->account->update($id, Input::all());
	}

	public function search()
	{
		return $this->account->search( Input::all() );
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		return $this->account->destroy($id);
	}

	public function getFormData(){
		return $this->account->getFormData();
	}

	public function getCitiesByState($id){
		return $this->account->getCitiesByState($id);
	}

	public function getAccountsByName(){
		if(array_key_exists('name', Input::all()))
			$name = Input::get('name');
		else
			$name = '';
		
		return $this->account->getAccountsByName( $name );
	}	

	public function getZipcodeUsingCity($city){
		return $this->account->getZipcodeUsingCity($city);
	}

}