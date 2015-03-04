<?php

class NotificationDetails extends Eloquent {
    protected $fillable = array('notificationobject_id', 'details','actor');

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'notificationdetails';

    public function notification() {
        return $this->hasOne('Users', 'actor', 'id');
    }

    public function notificationobject() {
        return $this->hasOne('NotificationObject', 'notificationtype_id', 'id');
    }

    public function notificationdetails(){
        return $this->hasMany('NotificationDetails', 'id', 'notificationobject_id');
    }

}