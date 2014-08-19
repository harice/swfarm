<?php

namespace APIv1;

use BaseController;
use ContactRepositoryInterface;
use Input;
use Config;


class ContactController extends BaseController {

	public function __construct(ContactRepositoryInterface $contact)
	{
		$this->contact = $contact;
	}
	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
		return $this->contact->findAll( Input::all() );
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{ 
		return $this->contact->store( Input::all() );
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
		return $this->contact->findById($id);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		return $this->contact->update($id, Input::all());
	}

	public function search()
	{
		return $this->contact->search( Input::all() );
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		return $this->contact->destroy($id);
	}

    /**
     * Check if Account has rate.
     * 
     * @param type $account_id
     * @return boolean
     */
    public function hasRate($account_id)
    {
        $response = array(
            'has_rate' => $this->contact->hasRate($account_id)
        );
        return $response;
    }
}