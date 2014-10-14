<?php

class SyncRepository implements SyncInterface {
	public function syncing($type) {
		$return = '';
		switch($type) {
			case 'states':
				$return = AddressStates::all();
				break;

			case 'accounttypes':
				$return = Accounttype::all();
				break;

			case 'accounts':
				$return = Account::with('accounttypes')->get()->each(function($account_o){
					// global $accounttypes_a;
					// $accounttypes_a = array();
					$account_o->accounttypes->each(function($accounttypes_o) {
						// global $accounttypes_a;
						// $accounttypes_a[] = $accounttypes_o->id;
						$accounttypes_o->account_id = $accounttypes_o->pivot->account_id;
						unset($accounttypes_o->pivot);
					});
					// unset($account_o->accounttypes);
					// $account_o->accounttypes = $accounttypes_a;
				})->toArray();
				break;

			case 'address':
				$return = Address::all();
				break;
		}

		return Response::json($return);
	}
}