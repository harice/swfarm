<?php

/**
 * Description of Notification Lib
 *
 * @author Avs
 */
class NotificationLibrary {

	public static function getNumberOfNotification($userId){
		return NotificationObject::whereHas('notification', function($query) use ($userId){
					$query->where('user_id', '=', $userId)->where('isSeen', '=', false);
				})->count();
	}

	public static function pushNotification($module, $data = null){
		$notificationLib = new NotificationLibrary();
		switch ($module) {
			case Config::get('constants.ORDER_CREATED_NOTIFICATIONTYPE'):
			case Config::get('constants.ORDER_UPDATED_NOTIFICATIONTYPE'):
				$notificationLib->orderNotification($module, $data);
				break;
			case Config::get('constants.ORDER_SCHEDULE_CREATED_NOTIFICATIONTYPE'):
			case Config::get('constants.ORDER_SCHEDULE_UPDATED_NOTIFICATIONTYPE'):
				$notificationLib->transportScheduleNotification($module, $data);
				break;
			case Config::get('constants.ORDER_WEIGHTTICKET_CREATED_NOTIFICATIONTYPE'):
			case Config::get('constants.ORDER_WEIGHTTICKET_UPDATED_NOTIFICATIONTYPE'):
				$notificationLib->weightticketNotification($module, $data);
				break;
			case Config::get('constants.INVENTORY_CREATED_NOTIFICATIONTYPE'):
				$notificationLib->inventoryNotification($module, $data);
				break;
			default:
				# code...
				break;
		}
	}

	public static function pullNotification($userId){
         $notification = NotificationObject::with('notificationtype')->whereHas('notification', function($query) use ($userId){
        					$query->where('user_id', '=', $userId)
        						  ->where('isSeen', '=', false);
        				})
         				->orderby('created_at', 'desc')
         				->get(array('id', 'notificationtype_id', 'details', 'updated_at'))->toArray();

        //call the notificationMarkAsSeen here
        $notificatinoLib = new NotificationLibrary;
        $notificatinoLib->notificationMarkAsSeen($userId);

        return $notification;
	}

	public static function pullSeenNotificationList($userId, $params){
		$params = array_filter($params);

	    $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
	    $page = isset($params['page']) ? $params['page'] : 1;
	    
        $notification = NotificationObject::with('notificationtype')->whereHas('notification', function($query) use ($userId){
        					$query->where('user_id', '=', $userId);
        				})
         				->orderby('created_at', 'desc')
         				->paginate($perPage)->toArray();

        return $notification;
	}

	private function notificationMarkAsSeen($userId){
		$userNotification_o = Notification::where('user_id', '=', $userId)->where('isSeen', '=', false)->first();
		if(!is_null($userNotification_o)){
			$userNotification_o->isSeen = true;
			$userNotification_o->save();
		}
	}

	private function orderNotification($module, $orderId){
		//get data
		DB::transaction(function() use ($module, $orderId){
			$order = Order::find($orderId);
			if($order->ordertype == Config::get('constants.ORDERTYPE_PO'))
				$category_role = array(Config::get('constants.PURCHASE_ORDER_PERMISSION_CATEGORY'));
			else
				$category_role = array(Config::get('constants.SALES_ORDER_PERMISSION_CATEGORY'));

			if(!is_null($order)){
				$roles_a = $this->getAllRolesWithPermissionCategoryGiven($category_role);
				$users_a = $this->getAllUserWithRolesGiven($roles_a);
				if($order->ordertype == Config::get('constants.ORDERTYPE_PO')){ //PO
					if($module == Config::get('constants.ORDER_CREATED_NOTIFICATIONTYPE')){
						$data = array('details' =>'Purchase order '.$order->order_number.' created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $order->id);
					}
					else {
						$data = array('details' =>'Purchase order '.$order->order_number.' updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $order->id);
					}
				} else {
					if($module == Config::get('constants.ORDER_CREATED_NOTIFICATIONTYPE')){
						$data = array('details' =>'Sales order '.$order->order_number.' created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $order->id);
					}
					else {
						$data = array('details' =>'Sales order '.$order->order_number.' updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $order->id);
					}
				}

				if(!is_null($users_a)){
					foreach($users_a as $user){
						//get the notification id on notification table which is unseen, else create a new notification id
						$notification_id = $this->generateNotificationId($user['id']);	
						$this->addNotificationobject($notification_id, $module, $data);
					}
				}
			}
		});
	}

	private function transportScheduleNotification($module, $scheduleId){
		DB::transaction(function() use ($module, $scheduleId){
			$schedule = TransportSchedule::with('order')->find($scheduleId);
			if($schedule->order->ordertype == Config::get('constants.ORDERTYPE_PO'))
				$category_role = array(Config::get('constants.PURCHASE_ORDER_PERMISSION_CATEGORY'));
			else
				$category_role = array(Config::get('constants.SALES_ORDER_PERMISSION_CATEGORY'));

			if(!is_null($schedule)){
				$roles_a = $this->getAllRolesWithPermissionCategoryGiven($category_role);
				$users_a = $this->getAllUserWithRolesGiven($roles_a);

				if($schedule->order->ordertype == Config::get('constants.ORDERTYPE_PO')){ //PO
					if($module == Config::get('constants.ORDER_SCHEDULE_CREATED_NOTIFICATIONTYPE')){
						$data = array('details' =>'Schedule for purchase order '.$schedule->order->order_number.' is created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
					} else {
						$data = array('details' =>'Schedule for purchase order '.$schedule->order->order_number.' is updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
					}
				} else { //SO
					if($module == Config::get('constants.ORDER_SCHEDULE_CREATED_NOTIFICATIONTYPE')){
						$data = array('details' =>'Schedule for sales order '.$schedule->order->order_number.' is created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
					} else {
						$data = array('details' =>'Schedule for sales order '.$schedule->order->order_number.' is updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
					}
				}
				
				if(!is_null($users_a)){
					foreach($users_a as $user){
						//get the notification id on notification table which is unseen, else create a new notification id
						$notification_id = $this->generateNotificationId($user['id']);	
						$this->addNotificationobject($notification_id, $module, $data);
					}
				}
			}
		});
	}

	private function weightticketNotification($module, $weightticketId){
		DB::transaction(function() use ($module, $weightticketId){
			$weightticket = WeightTicket::with('transportschedule.order')->find($weightticketId);
			if($weightticket->transportschedule->order->ordertype == Config::get('constants.ORDERTYPE_PO'))
				$category_role = array(Config::get('constants.PURCHASE_ORDER_PERMISSION_CATEGORY'));
			else
				$category_role = array(Config::get('constants.SALES_ORDER_PERMISSION_CATEGORY'));

			if(!is_null($weightticket)){
				$roles_a = $this->getAllRolesWithPermissionCategoryGiven($category_role);
				$users_a = $this->getAllUserWithRolesGiven($roles_a);

				if($weightticket->transportschedule->order->ordertype == Config::get('constants.ORDERTYPE_PO')){ //PO
					if($module == Config::get('constants.ORDER_WEIGHTTICKET_CREATED_NOTIFICATIONTYPE'))
						$data = array('details' => 'Weight ticket('.$weightticket->weightTicketNumber.') for purchase order '.$weightticket->transportschedule->order->order_number.' is created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $weightticket->id);
					else if($module == Config::get('constants.ORDER_WEIGHTTICKET_UPDATED_NOTIFICATIONTYPE'))
						$data = array('details' => 'Weight ticket('.$weightticket->weightTicketNumber.') for purchase order '.$weightticket->transportschedule->order->order_number.' is updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $weightticket->id);
				} else {
					if($module == Config::get('constants.ORDER_WEIGHTTICKET_CREATED_NOTIFICATIONTYPE'))
						$data = array('details' => 'Weight ticket('.$weightticket->weightTicketNumber.') for sales order '.$weightticket->transportschedule->order->order_number.' is created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $weightticket->id);
					else if($module == Config::get('constants.ORDER_WEIGHTTICKET_UPDATED_NOTIFICATIONTYPE'))
						$data = array('details' => 'Weight ticket('.$weightticket->weightTicketNumber.') for sales order '.$weightticket->transportschedule->order->order_number.' is updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $weightticket->id);
				}
				
				if(!is_null($users_a)){
					foreach($users_a as $user){
						//get the notification id on notification table which is unseen, else create a new notification id
						$notification_id = $this->generateNotificationId($user['id']);	
						$this->addNotificationobject($notification_id, $module, $data);
					}
				}
			}
		});
	}

	private function inventoryNotification($module, $inventoryId){
		//get data
		DB::transaction(function() use ($module, $inventoryId){
			$inventory = Inventory::find($inventoryId);
			$categoryRole_a = array(Config::get('constants.PRODUCT_MANAGEMENT_PERMISSION_CATEGORY'), Config::get('constants.ADMIN_PERMISSION_CATEGORY'));
		
			if(!is_null($inventory)){
				$roles_a = $this->getAllRolesWithPermissionCategoryGiven($categoryRole_a);
				$users_a = $this->getAllUserWithRolesGiven($roles_a);
				switch ($inventory->transactiontype_id) {
					case Config::get('constants.INVENTORY_TRANSACTIONTYPE_SO'):
						$data = array('details' =>'Inventory has been deducted for sales order by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $inventory->id);
						break;
					case Config::get('constants.INVENTORY_TRANSACTIONTYPE_PO'):
						$data = array('details' =>'Inventory has been added for purchase order by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $inventory->id);
						break;
					case Config::get('constants.INVENTORY_TRANSACTIONTYPE_TRANSFER'):
						$data = array('details' =>'Inventory has been updated, transfer products by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $inventory->id);
						break;
					case Config::get('constants.INVENTORY_TRANSACTIONTYPE_ISSUE'):
						$data = array('details' =>'Inventory has been deducted because of issue operation by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $inventory->id);
						break;
					case Config::get('constants.INVENTORY_TRANSACTIONTYPE_RECEIPT'):
						$data = array('details' =>'Inventory has been updated because of receipt operation by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $inventory->id);
						break;
					default:
						# code...
						break;
				}

				if(!is_null($users_a)){
					foreach($users_a as $user){
						//get the notification id on notification table which is unseen, else create a new notification id
						$notification_id = $this->generateNotificationId($user['id']);	
						$this->addNotificationobject($notification_id, $module, $data);
					}
				}
			}
		});
	}

	private function generateNotificationId($userId){
		//check if the user has unseen notification, else create new notification entry on notification table
		$notification_o = Notification::where('user_id', '=', $userId)->where('isSeen', '=', false)->first();

		if(!is_null($notification_o)){
			return $notification_o->id;
		} else {
			$notification_new_o = new Notification;
			$notification_new_o->user_id = $userId;
			$notification_new_o->save();
			return $notification_new_o->id;
		}
	}

	private function addNotificationobject($notification_id, $notificationtype, $data = null){
		$notificationObject_o_existing =  NotificationObject::where('notification_id', '=', $notification_id)->where('notificationtype_id', '=', $notificationtype)->where('extra', '=', $data['extra'])->first();

		if(!is_null($notificationObject_o_existing)){ //if same unseen notification type exist, just update the updated_at, this prevents showing same notificaiton like updates of the same order of same user
			$notificationObject_o_existing->touch();
		} else {
			$notificationObject_o = new NotificationObject;
			$notificationObject_o->notification_id = $notification_id;
			$notificationObject_o->notificationtype_id = $notificationtype;
			if(isset($data['extra'])){
				$notificationObject_o->extra = $data['extra'];
			}
			if(!is_null($data)){
				if(isset($data['details'])){
					$notificationObject_o->details = $data['details'];
				}
				if(isset($data['actor'])){
					$notificationObject_o->actor = $data['actor'];
				}
			}
			$notificationObject_o->save();
		}
	}

	private function getAllRolesWithPermissionCategoryGiven($permissionCategory_a){
		$roles = Roles::whereHas('permissionCategoryType', function($query) use ($permissionCategory_a) {
					$query->wherehas('permissionCategory', function($query) use ($permissionCategory_a){
						$query->whereIn('id', $permissionCategory_a);
					});
				})
				->has('permissionCategoryType')
				->get(array('id', 'name'));

		return (!is_null($roles)) ? $roles->toArray() : null;
	}

	private function getAllUserWithRolesGiven($roles){
		$roles_a = array();
		foreach($roles as $role){
			array_push($roles_a, $role['id']);
		}

		if(count($roles_a) == 0)
			return null;

		$users = User::whereHas('roles', function($query) use ($roles_a) {
					$query->whereIn('roles.id', $roles_a);
				})->get(array('id', 'firstname', 'lastname'));

		return (!is_null($users)) ? $users->toArray() : null;
	}

}