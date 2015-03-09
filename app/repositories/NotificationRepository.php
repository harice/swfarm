<?php

/**
 * Description of NotificationRepository
 *
 * @author Avs
 */
class NotificationRepository implements NotificationRepositoryInterface {

    public function pullNotification($userId){
    	return NotificationLibrary::pullNotification($userId);
    }

    public function getNumberOfNotification($userId){
    	return NotificationLibrary::getNumberOfNotification($userId);
    }

    public function pullSeenNotificationList($userId, $params = null){
    	return NotificationLibrary::pullSeenNotificationList($userId, $params);
    }

}
?>