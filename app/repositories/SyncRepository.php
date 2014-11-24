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

				$accounts = Account::with('accounttype')->with('address.storagelocation.section')->orderBy($sortby,$orderby);

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

				$result = $accounts->get();
				break;

			case 'contact':
				$result = Contact::all();
				break;

			case 'address':
				$result = Address::all();
				break;

			case 'storagelocation':
				$result = StorageLocation::all();
				break;

			case 'section':
				$result = Section::all();
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

			case 'order':
				$result = Order::all();
				break;

			case 'orderaddress':
				$result = OrderAddress::all();
				break;

			case 'productsummary':
				$result = ProductOrderSummary::all();
				break;

			case 'productorder':
				$result = ProductOrder::all();
				break;

			case 'stack':
				$result = Stack::all();
				break;

			case 'stacklocation':
				$result = StackLocation::all();
				break;
		}

		return Response::json($result);
	}
}