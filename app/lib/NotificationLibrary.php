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
			case Config::get('constants.PO_CREATED_NOTIFICATIONTYPE'):
			case Config::get('constants.PO_UPDATED_NOTIFICATIONTYPE'):
				$notificationLib->orderNotification($module, $data);
				break;
			case Config::get('constants.SO_CREATED_NOTIFICATIONTYPE'):
			case Config::get('constants.SO_UPDATED_NOTIFICATIONTYPE'):
				$notificationLib->orderNotification($module, $data, false);
				break;
			case Config::get('constants.PO_SCHEDULE_CREATED_NOTIFICATIONTYPE'):
			case Config::get('constants.PO_SCHEDULE_UPDATED_NOTIFICATIONTYPE'):
				$notificationLib->transportScheduleNotification($module, $data);
				break;
			case Config::get('constants.SO_SCHEDULE_CREATED_NOTIFICATIONTYPE'):
			case Config::get('constants.SO_SCHEDULE_UPDATED_NOTIFICATIONTYPE'):
				$notificationLib->transportScheduleNotification($module, $data, false);
				break;
			case Config::get('constants.PO_WEIGHTTICKET_CREATED_NOTIFICATIONTYPE'):
			case Config::get('constants.PO_WEIGHTTICKET_UPDATED_NOTIFICATIONTYPE'):
				$notificationLib->weightticketNotification($module, $data);
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
         				->get()->toArray();

        //call the notificationMarkAsSeen here
        $notificatinoLib = new NotificationLibrary;
        $notificatinoLib->notificationMarkAsSeen($userId);

        return $notification;
	}

	private function notificationMarkAsSeen($userId){
		$userNotification_o = Notification::where('user_id', '=', $userId)->where('isSeen', '=', false)->first();
		if(!is_null($userNotification_o)){
			$userNotification_o->isSeen = true;
			$userNotification_o->save();
		}
	}

	private function orderNotification($module, $orderId, $isPO = true){
		//get data
		DB::transaction(function() use ($module, $orderId, $isPO){
			$order = Order::find($orderId);
			if($isPO)
				$category_role = Config::get('constants.PURCHASE_ORDER_PERMISSION_CATEGORY');
			else
				$category_role = Config::get('constants.SALES_ORDER_PERMISSION_CATEGORY');

			if(!is_null($order)){
				$roles_a = $this->getAllRolesWithPermissionCategoryGiven($category_role);
				$users_a = $this->getAllUserWithRolesGiven($roles_a);

				if($module == Config::get('constants.PO_CREATED_NOTIFICATIONTYPE')){
					$data = array('details' =>'Purchase order '.$order->order_number.' created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $order->id);
				}
				else if($module == Config::get('constants.PO_UPDATED_NOTIFICATIONTYPE')){
					$data = array('details' =>'Purchase order '.$order->order_number.' updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $order->id);
				}
				else if($module == Config::get('constants.SO_CREATED_NOTIFICATIONTYPE')){
					$data = array('details' =>'Sales order '.$order->order_number.' created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $order->id);
				}
				else if($module == Config::get('constants.SO_UPDATED_NOTIFICATIONTYPE')){
					$data = array('details' =>'Sales order '.$order->order_number.' updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $order->id);
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

	private function transportScheduleNotification($module, $scheduleId, $isPO = true){
		DB::transaction(function() use ($module, $scheduleId, $isPO){
			$schedule = TransportSchedule::with('order')->find($scheduleId);
			if($isPO)
				$category_role = Config::get('constants.PURCHASE_ORDER_PERMISSION_CATEGORY');
			else
				$category_role = Config::get('constants.SALES_ORDER_PERMISSION_CATEGORY');

			if(!is_null($schedule)){
				$roles_a = $this->getAllRolesWithPermissionCategoryGiven($category_role);
				$users_a = $this->getAllUserWithRolesGiven($roles_a);

				if($schedule->order->ordertype == Config::get('constants.ORDERTYPE_PO')){ //PO
					if($module == Config::get('constants.PO_SCHEDULE_CREATED_NOTIFICATIONTYPE')){
						$data = array('details' =>'Schedule for purchase order '.$schedule->order->order_number.' is created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
					} else {
						$data = array('details' =>'Schedule for purchase order '.$schedule->order->order_number.' is updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
					}
				} else { //SO
					if($module == Config::get('constants.PO_SCHEDULE_CREATED_NOTIFICATIONTYPE')){
						$data = array('details' =>'Schedule for sales order '.$schedule->order->order_number.' is created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
					} else {
						$data = array('details' =>'Schedule for sales order '.$schedule->order->order_number.' is updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
					}
				}
					
				// else if($module == Config::get('constants.PO_SCHEDULE_UPDATED_NOTIFICATIONTYPE'))
				// 	$data = array('details' =>'Schedule for purchase order '.$schedule->order->order_number.' is updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
				// else if($module == Config::get('constants.SO_SCHEDULE_CREATED_NOTIFICATIONTYPE'))
				// 	$data = array('details' =>'Schedule for sales order '.$schedule->order->order_number.' is created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);
				// else if($module == Config::get('constants.SO_SCHEDULE_UPDATED_NOTIFICATIONTYPE'))
				// 	$data = array('details' =>'Schedule for sales order '.$schedule->order->order_number.' is updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $schedule->id);

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

	private function weightticketNotification($module, $weightticketId, $isPO = true){
		DB::transaction(function() use ($module, $weightticketId, $isPO){
			$weightticket = WeightTicket::with('transportschedule.order')->find($weightticketId);
			if($isPO)
				$category_role = Config::get('constants.PURCHASE_ORDER_PERMISSION_CATEGORY');
			else
				$category_role = Config::get('constants.SALES_ORDER_PERMISSION_CATEGORY');

			if(!is_null($weightticket)){
				$roles_a = $this->getAllRolesWithPermissionCategoryGiven($category_role);
				$users_a = $this->getAllUserWithRolesGiven($roles_a);
				if($module == Config::get('constants.PO_WEIGHTTICKET_CREATED_NOTIFICATIONTYPE'))
					$data = array('details' => 'Weight ticket('.$weightticket->weightTicketNumber.') for purchase order '.$weightticket->transportschedule->order->order_number.' is created by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $weightticket->id);
				else if($module == Config::get('constants.PO_WEIGHTTICKET_UPDATED_NOTIFICATIONTYPE'))
					$data = array('details' => 'Weight ticket('.$weightticket->weightTicketNumber.') for purchase order '.$weightticket->transportschedule->order->order_number.' is updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id, 'extra' => $weightticket->id);
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

	private function getAllRolesWithPermissionCategoryGiven($permissionCategory){
		$roles = Roles::whereHas('permissionCategoryType', function($query) use ($permissionCategory) {
					$query->wherehas('permissionCategory', function($query) use ($permissionCategory){
						$query->where('id', '=', $permissionCategory);
					});
				})
				->has('permissionCategoryType')
				->get(array('id', 'name'))
				->toArray();

		return $roles;
	}

	private function getAllUserWithRolesGiven($roles){
		$roles_a = array();
		foreach($roles as $role){
			array_push($roles_a, $role['id']);
		}

		$users = User::whereHas('roles', function($query) use ($roles_a) {
					$query->whereIn('roles.id', $roles_a);
				})->get(array('id', 'firstname', 'lastname'))->toArray();

		return $users;
	}

	private function getPermissionCategoryOfRole($roleId){

	}
}