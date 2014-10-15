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
		}

		return Response::json($return);
	}
}