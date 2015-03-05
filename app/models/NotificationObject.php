<?php

class NotificationObject extends Eloquent {
    protected $fillable = array('notification_id', 'notificationtype_id');

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'notificationobject';

    public function notification() {
        return $this->hasOne('Notification', 'id', 'notification_id');
    }

    public function notificationtype() {
        return $this->hasOne('NotificationType', 'id', 'notificationtype_id');
    }

    public function notificationdetails(){
        return $this->hasMany('NotificationDetails', 'id', 'notificationobject_id');
    }

}