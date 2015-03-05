<?php

/**
 * Description of Notification Lib
 *
 * @author Avs
 */
class NotificationLibrary {

	public static function getNumberOfNotification($userId){
		return Notification::where('user_id', '=', $userId)->where('isSeen', '=', false)->count();
	}


	public static function pushNotification($module, $data = null){
		$notificationLib = new NotificationLibrary();
		switch ($module) {
			case Config::get('constants.PO_CREATED_NOTIFICATIONTYPE'):
				$notificationLib->purchaseorderNotification($module, $data);
				break;
			case Config::get('constants.PO_UPDATED_NOTIFICATIONTYPE'):
				$notificationLib->purchaseorderNotification($module, $data);
				break;
			default:
				# code...
				break;
		}
	}

	public static function pullNotification($userId){
        // $notification = NotificationObject::with('notificationtype')->whereHas('notification', function($query) use ($userId){
        // 					$query->where('user_id', '=', $userId)
        // 						  ->where('isSeen', '=', false);
        // 				})->groupBy('notificationtype_id')->select('notificationobject.id', 'notificationobject.notificationtype_id', DB::raw('count(*) as total'))->get()->toArray();

         $notification = NotificationObject::with('notificationtype')->whereHas('notification', function($query) use ($userId){
        					$query->where('user_id', '=', $userId)
        						  ->where('isSeen', '=', false);
        				})
         				// ->groupBy('notificationtype_id')
         				// ->select('notificationobject.id', 'notificationobject.notificationtype_id', DB::raw('count(*) as total'))
         				->orderby('created_at', 'desc')
         				->get()->toArray();

        // $notification = Notification::with('notificationobject.notificationtype')
        // 					->with(array('notificationobject' => function($query){
        // 						// $query->select('id', 'notificationtype_id')->get();
        // 						// ->groupBy('notificationtype_id');
        // 					}))
        // 					->where('user_id', '=', $userId)
        // 					->where('isSeen', '=', false)
        // 					->get();

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

	private function purchaseorderNotification($module, $orderId){
		//get data
		DB::transaction(function() use ($module, $orderId){
			$order = Order::find($orderId);
			$purchaseorder_category_role = Config::get('constants.PURCHASE_ORDER_PERMISSION_CATEGORY');
			if(!is_null($order)){
				$roles_a = $this->getAllRolesWithPermissionCategoryGiven($purchaseorder_category_role);
				$users_a = $this->getAllUserWithRolesGiven($roles_a);
				if($module == Config::get('constants.PO_CREATED_NOTIFICATIONTYPE'))
					$data = array('details' =>'Purchase order '.$order->order_number.' created by '.Auth::user()->firstname, 'actor' => Auth::user()->id);
				else if($module == Config::get('constants.PO_UPDATED_NOTIFICATIONTYPE'))
					$data = array('details' =>'Purchase order '.$order->order_number.' updated by '.Auth::user()->firstname, 'actor' => Auth::user()->id);
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
		$notificationObject_o = new NotificationObject;
		$notificationObject_o->notification_id = $notification_id;
		$notificationObject_o->notificationtype_id = $notificationtype;
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