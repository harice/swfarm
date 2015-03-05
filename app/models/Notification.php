<?php

class Notification extends Eloquent {
    protected $fillable = array('user_id', 'isSeen');

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'notification';

    public function user() {
        return $this->belongsTo('User', 'id', 'user_id');
    }

    public function notificationobject() {
        return $this->hasMany('NotificationObject', 'notification_id', 'id');
    }

}