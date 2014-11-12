<?php

class SyncRepository implements SyncInterface {
	public function syncing($type, $params) {
		$result = '';
		switch($type) {
			case 'state':
				$result = AddressStates::all();
				break;

			case 'account':
				$params = array_filter($params);

				$sortby = isset($params['sortby']) ? $params['sortby'] : 'name';
				$orderby = isset($params['orderby']) ? $params['orderby'] : 'ASC';

				$accounts = Account::with('accounttype')->with('address.storagelocation.section')->with('contact')->orderBy($sortby,$orderby);

				if(isset($params['filter'])) {
					$filter = $params['filter'];
					$accounts->whereHas('accounttype', function($q) use($filter) { $q->where('accounttype_id','=', $filter); } );
				}

				if(isset($params['search'])) {
					$search = $params['search'];
					$accounts->where(function($q) use($search) {
					$q->orWhere('name','like','%'.$search.'%')
						->orWhere('website','like','%'.$search.'%')
						->orWhere('description','like','%'.$search.'%');
					});
				}

				$result = $accounts->get()->toArray();
				break;

			case 'accounttype':
				$result = Accounttype::all();
				break;

			case 'addresstype':
				$result = AddressType::all();
				break;

			case 'product':
				$result = Product::all();
				break;

			case 'status':
				$result = Status::all();
				break;

			case 'location':
				$result = Location::all();
				break;

			case 'natureofsale':
				$result = NatureOfSale::all();
				break;

			case 'reason':
				$result = Reason::all();
				break;

			case 'user':
				$result = User::all();
				break;
		}

		return Response::json($result);
	}
}