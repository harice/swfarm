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
		return $this->account->paginate( Input::all() );
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

    public function getCustomerAccount(){
		return $this->account->getCustomerAccount(Input::get('search'));
	}

	public function getProducerAccount(){
		return $this->account->getProducerAccount(Input::get('search'));
	}

	public function getAddress(){
		return $this->account->getAddress(Input::get('accountId'));
	}

    /**
     * Get Stack Address
     *
     * @param int $id Account Id
     * @return Response
     */
    public function getStackAddress($id)
    {
		return $this->account->getStackAddress($id);
	}

	public function getAccountsByType(){
		return $this->account->getAccountsByType(Input::get('accountTypeId'));
	}

	public function getLoaderAccount(){
		return $this->account->getLoaderAccount();
	}

	public function getCustomerAccountList(){
		return $this->account->getCustomerAccountList();
	}

	public function getTrailerAccount(){
		return $this->account->getTrailerAccount();
	}

	public function getScalerAccount(){
		return $this->account->getScalerAccount();
	}

	public function getProducerAndWarehouseAccount(){
		return $this->account->getProducerAndWarehouseAccount();
	}

	public function getScaleList(){
		return $this->account->getScaleList(Input::get('accountId'));
	}

	public function getTrailerListByAccount(){
		return $this->account->getTrailerListByAccount(Input::get('accountId'));
	}

	public function getAllContactOnAccount(){
		return $this->account->getAllContactOnAccount(Input::get('accountId'));
	}

	public function getTruckerAccountTypes(){
		return $this->account->getTruckerAccountTypes();
	}

    public function getContracts($id)
    {
        return $this->account->getContracts($id);
    }

    public function accountSync(){
    	return $this->account->accountSync(Input::all());
    }

    public function getAllAccounts(){
    	return $this->account->getAllAccounts(Input::all());
    }


}