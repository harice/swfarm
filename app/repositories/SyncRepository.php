<?php

class SyncRepository implements SyncInterface {
	public function syncing($type) {
		$return = '';
		switch($type) {
			case 'states':
				$return = AddressStates::all();
				break;

			case 'account_types':
				$return = Accounttype::all();
				break;

			case 'accounts':
				$return = Account::with('accounttypes')->with('address')->get()->each(function($accounts){
					global $accounttypes_a;
					$accounttypes_a = array();
					$accounts->accounttypes->each(function($accounttypes) use($accounttypes_a){
						global $accounttypes_a;
						$accounttypes_a[] = intval($accounttypes->id);
					});
					unset($accounts->accounttypes);
					$accounts->accounttypes = $accounttypes_a;
				})->toArray();
				break;
		}

		return Response::json($return);
	}
}