<?php

class SyncRepository implements SyncInterface {
	public function addOrder($params) {
		//
	}
	
	public function syncing($type, $params) {
		$result = '';
		switch($type) {
			case 'state':
				$result = AddressStates::all();
				break;

			case 'account':
				$result = Account::with('accounttype')->get();
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

			case 'contract':
				$result = Contract::all();
				break;

			case 'orderreason':
				$result = OrderCancellingReason::all();
				break;

			case 'truck':
				$result = Truck::all();
				break;

			case 'transportschedule':
				$result = TransportSchedule::all();
				break;

			case 'transportscheduleproduct':
				$result = TransportScheduleProduct::all();
				break;

			case 'contractproduct':
				$result = ContractProducts::all();
				break;

			case 'weightticketproduct':
				$result = WeightTicketProducts::all();
				break;
		}

		return Response::json($result);
	}
}