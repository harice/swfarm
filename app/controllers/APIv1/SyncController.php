<?php

namespace APIv1;

use BaseController;
use Input;
use SyncInterface;
use AccountRepositoryInterface;

class SyncController extends BaseController {

	public function __construct(SyncInterface $sync, AccountRepositoryInterface $account)
	{
		$this->sync = $sync;
		$this->account = $account;
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  string  $type
	 * @return Response
	 */
	public function show($type)
	{
		switch ($type) {
			case 'account':
				return $this->account->getAllAccounts(Input::all());
				break;
			
			default:
				return $this->sync->syncing($type);
				break;
		}
	}


	public function store()
	{
		switch ($type) {
			case 'account':
				$this->account->accountSync(Input::all());
				break;
		}
	}


}
