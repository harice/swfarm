<?php
 
class PickupScheduleRepository implements PickupScheduleRepositoryInterface {

  public function findById($id){
    $pickupSchedule = PickupSchedule::with('trucker')
                      ->with('originLoader')
                      ->with('destinationLoader')
                      ->find($id);
    if($pickupSchedule){
      $pickupSchedule = $pickupSchedule->toArray();
      $pickupSchedule['scheduledate'] = date('Y-m-d', strtotime($pickupSchedule['pickupdate']));
      $pickupSchedule['scheduletimeHour'] = date('h', strtotime($pickupSchedule['pickupdate']));
      $pickupSchedule['scheduletimeMin'] = date('i', strtotime($pickupSchedule['pickupdate']));
      $pickupSchedule['scheduletimeAmPm'] = date('A', strtotime($pickupSchedule['pickupdate']));

      return Response::json(
          $pickupSchedule,
          200
        );
    } else {
      return Response::json(array(
        'error' => true,
        'message' => "Pickup date not found."),
        200
    );
    }
  }

  public function paginate($params){
    $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST'); //default to 10 items, see app/config/constants
    $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
    $sortby = isset($params['sortby']) ? $params['sortby'] : 'pickupdate'; //default sort to pickupdate
    $orderby = isset($params['orderby']) ? $params['orderby'] : 'DESC'; //default order is Ascending
    $offset = $page*$perPage-$perPage;
    $bidId = $params['bidId'];
    //pulling of data
    $count = PickupSchedule::where('bid_id', '=', $bidId)->count();
    $pickupSchedules = PickupSchedule::with('trucker')
                    ->with('originLoader')
                    ->with('destinationLoader')
                    ->with('trucker.accounttype')
                    ->where('bid_id', '=', $bidId)
                    ->take($perPage)
                    ->offset($offset)
                    ->orderBy($sortby, $orderby)
                    ->get();
    foreach($pickupSchedules as $item){
      $item['scheduledate'] = date('Y-m-d', strtotime($item['pickupdate']));
      $item['scheduletimeHour'] = date('h', strtotime($item['pickupdate']));
      $item['scheduletimeMin'] = date('i', strtotime($item['pickupdate']));
      $item['scheduletimeAmPm'] = date('A', strtotime($item['pickupdate']));
    }
    return Response::json(array(
      'total'=>$count,
      'data'=>$pickupSchedules->toArray()
    ));

  }

  public function addOrUpdatePickupSchedule($data, $pickupScheduleId = null){
    $rules = array(
      'bid_id' => 'required',
      'scheduledate' => 'required|date',
      'scheduletimeHour' => 'required',
      'scheduletimeMin' => 'required',
      'scheduletimeAmPm' => 'required',
      'trucker' => 'required',
      'distance' => 'required',
      'fuelcharge' => 'required',
      'originLoader' => 'required',
      'originLoaderFee' => 'required',
      'destinationLoader' => 'required',
      'destinationLoaderFee' => 'required',
    );

    $this->validate($data, $rules);
    if($pickupScheduleId == null)
      $pickupschedule = new PickupSchedule;
    else
      $pickupschedule = PickupSchedule::find($pickupScheduleId);
    //convert pass date parameters to timestamp
    $data['scheduletimeMin'] = str_pad($data['scheduletimeMin'], 2, '0', STR_PAD_LEFT); //adding leading zero
    $pickupdate = Date('Y-m-d H:i:s', strtotime($data['scheduledate'].' '.$data['scheduletimeHour'].':'.$data['scheduletimeMin'].' '.$data['scheduletimeAmPm']));
    $pickupschedule->bid_id = $data['bid_id'];
    $pickupschedule->pickupdate = $pickupdate;
    $pickupschedule->trucker_id = $data['trucker'];
    $pickupschedule->distance = $data['distance'];
    $pickupschedule->fuelcharge = $data['fuelcharge'];
    $pickupschedule->originloader_id = $data['originLoader'];
    $pickupschedule->originloadersfee = $data['originLoaderFee'];
    $pickupschedule->destinationloader_id = $data['destinationLoader'];
    $pickupschedule->destinationloadersfee = $data['destinationLoaderFee'];
    $pickupschedule->truckingrate = $data['truckingrate'];
   
    try{
      $pickupschedule->save();
    } catch(Exception $e){
      return Response::json(array(
        'error' => true,
        'message' => $e->errorInfo[2]),
        200
      );
    }

    if($pickupScheduleId == null){
      $message = 'Pickup Schedule successfully created.';
    } else {
      $message = 'Pickup Schedule successfully updated.';
    }

    return Response::json(array(
        'error' => false,
        'message' => $message),
        200
    );
  }


  public function deletePickupSchedule($id){
    $pickupschedule = PickupSchedule::find($id);

    if($pickupschedule){
      $pickupschedule->delete();

      $response = Response::json(array(
          'error' => false,
          'message' => 'Pickup schedule successfully deleted.'),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => "Pickup schedule not found"),
          200
      );
    }

    return $response;
  }
  
  public function validate($data, $rules){
    $validator = Validator::make($data, $rules);

    if($validator->fails()) { 
      throw new ValidationException($validator); 
    }
  }


  public function instance($data = array())
  {
    return new PickupSchedule($data);
  }

  public function getTruckerAccount($search){
    if($search == ''){
      return Response::json(array(
          'error' => true,
          'message' => "Search word is required"),
          200
      );
    } else{
      $accountIds = array(2, 4, 9); //operator, hauler and SWF trucker accounts ids
      $truckers = Account::with('accounttype')->whereHas('accounttype', function ($query) use ($search, $accountIds){
                    $query->whereIn('id', $accountIds);
                  })->where('name', 'like', '%'.$search.'%')->get(array('id', 'name', 'accounttype'));
      
      return Response::json(
        $truckers->toArray(),
        200);
      }
  }

  public function getLoaderAccount($search){
    if($search == ''){
    return Response::json(array(
        'error' => true,
        'message' => "Search word is required"),
        200
    );
  } else{
      $accountIds = array(3); //loader id
      $loader = Account::whereHas('accounttype', function ($query) use ($search, $accountIds){
                    $query->whereIn('id', $accountIds);
                  })->where('name', 'like', '%'.$search.'%')->get(array('id', 'name'));
      
      return Response::json(
        $loader->toArray(),
        200);
      }
  }

  private function displayLastQuery(){
    $queries = DB::getQueryLog();
    $last_query = end($queries);
    var_dump($last_query);
  }

}
