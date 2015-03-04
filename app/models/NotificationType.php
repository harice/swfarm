<?php

class NotificationType extends Eloquent {
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'notificationtype';

    public function notificationobject() {
        return $this->belongs('Notification', 'id', 'notificationtype_id');
    }

}