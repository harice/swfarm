<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use NotificationRepositoryInterface;
use Input;

/**
 * Description of TruckController
 *
 * @author Avs
 */

class NotificationController extends BaseController {
    
    public function __construct(NotificationRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function pullNotification($userId){
        $model = $this->repo->pullNotification($userId);
        return Response::json($model);
    }

    public function getNumberOfNotification($userId){
        $model = $this->repo->getNumberOfNotification($userId);
        return Response::json($model);
    }

    public function getSeenNotifications($userId){
        $model = $this->repo->pullSeenNotificationList($userId);
        return Response::json($model);
    }

}
