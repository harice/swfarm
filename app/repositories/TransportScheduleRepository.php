<?php
 
class TransportScheduleRepository implements TransportScheduleRepositoryInterface {

  public function getSchedule($id, $scheduleType = 1){ //default sked is pickup
    $transportSchedule = TransportSchedule::with('trucker')
                      ->with('originLoader')
                      ->with('destinationLoader')
                      ->where('id', '=', $id)
                      ->where('type', '=', $scheduleType)->first();
    if($transportSchedule){
      $transportSchedule = $transportSchedule->toArray();
      $transportSchedule['scheduledate'] = date('Y-m-d', strtotime($transportSchedule['date']));
      $transportSchedule['scheduletimeHour'] = date('h', strtotime($transportSchedule['date']));
      $transportSchedule['scheduletimeMin'] = date('i', strtotime($transportSchedule['date']));
      $transportSchedule['scheduletimeAmPm'] = date('A', strtotime($transportSchedule['date']));

      return $transportSchedule;
      
    } else {
      return array(
        'error' => true,
        'message' => "Schedule not found.");
    }
  }

  public function getAllTransportSchedules($params, $scheduleType = 1){ //default schedule type to pull is pickup
    $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST'); //default to 10 items, see app/config/constants
    $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
    $sortby = isset($params['sortby']) ? $params['sortby'] : 'date'; //default sort to date
    // $type = isset($params['type']) ? $params['type'] : 1; //default schedule type to pull is pickup
    $orderby = isset($params['orderby']) ? $params['orderby'] : 'DESC'; //default order is Ascending
    $offset = $page*$perPage-$perPage;
    $orderId = $params['order_id'];
    //pulling of data    
    $transportSchedules = TransportSchedule::with('trucker')
                    ->with('originLoader')
                    ->with('destinationLoader')
                    ->with('trucker.accounttype')
                    ->where('order_id', '=', $orderId)
                    ->where('type', '=', $scheduleType)
                    ->paginate($perPage);

    foreach($transportSchedules as $item){
        $item['scheduledate'] = date('Y-m-d', strtotime($item['date']));
        $item['scheduletimeHour'] = date('h', strtotime($item['date']));
        $item['scheduletimeMin'] = date('i', strtotime($item['date']));
        $item['scheduletimeAmPm'] = date('A', strtotime($item['date']));
    }

    return $transportSchedules;

  }

  public function addOrUpdateTransportSchedule($data, $transportScheduleId = null){
    // $rules = array(
    //   'order_id' => 'required',
    //   'scheduledate' => 'required|date',
    //   'scheduletimeHour' => 'required',
    //   'scheduletimeMin' => 'required',
    //   'scheduletimeAmPm' => 'required',
    //   'trucker' => 'required',
    //   'distance' => 'required',
    //   'fuelcharge' => 'required',
    //   'originLoader' => 'required',
    //   'originLoaderFee' => 'required',
    //   'destinationLoader' => 'required',
    //   'destinationLoaderFee' => 'required',
    // );
// var_dump($data);
    $this->validate($data, 'TransportSchedule');
    
    $result = DB::transaction(function() use ($data, $transportScheduleId){
      if($transportScheduleId == null)
        $transportschedule = new TransportSchedule;
      else
        $transportschedule = TransportSchedule::find($transportScheduleId);

      //convert pass date parameters to timestamp
      $data['scheduletimeMin'] = str_pad($data['scheduletimeMin'], 2, '0', STR_PAD_LEFT); //adding leading zero
      $data['date'] = Date('Y-m-d H:i:s', strtotime($data['scheduledate'].' '.$data['scheduletimeHour'].':'.$data['scheduletimeMin'].' '.$data['scheduletimeAmPm']));
      $data['truckingrate'] = isset($data['truckingrate']) ? $data['truckingrate'] : Config::get('constants.GLOBAL_PER_LIST');
      $data['type'] = isset($data['type']) ? $data['type'] : 1;


      $transportschedule->fill($data);

      // $transportschedule->order_id = $data['order_id'];
      // $transportschedule->date = $data['date'];
      // $transportschedule->trucker_id = $data['trucker_id'];
      // $transportschedule->distance = $data['distance'];
      // $transportschedule->fuelcharge = $data['fuelcharge'];
      // $transportschedule->originloader_id = $data['originLoader_id'];
      // $transportschedule->originloadersfee = $data['originLoaderFee'];
      // $transportschedule->destinationloader_id = $data['destinationLoader_id'];
      // $transportschedule->destinationloadersfee = $data['destinationLoaderFee'];
      // $transportschedule->truckingrate = isset($data['truckingrate']) ? $data['truckingrate'] : Config::get('constants.GLOBAL_PER_LIST');

      // if($transportScheduleId == null) //set only type when creating new schedule
      //   $transportschedule->type = isset($data['type']) ? $data['type'] : 1;
      
      $transportschedule->save();
      
      //when updating only
      if($transportScheduleId != null){
        $this->deleteProductToSchedule($transportschedule->id, $data['products']);
      }

      $this->addProductToSchedule($transportschedule->id, $data['products']);

      return $transportschedule->id;
    });

    if($result == null){
      $message = 'Schedule successfully created.';
    } else {
      $message = 'Schedule successfully updated.';
    }

    return array(
        'error' => false,
        'message' => $message);
  }

  private function addProductToSchedule($schedule_id, $products = array())
  {
      foreach ($products as $product) {
          $product['transportschedule_id'] = $schedule_id;

          $this->validate($product, 'transportscheduleproduct');
          if(isset($product['id']))
              $transportscheduleproduct = TransportScheduleProduct::find($product['id']);
          else
              $transportscheduleproduct = new TransportScheduleProduct();

          $transportscheduleproduct->fill($product);
          $transportscheduleproduct->save();
      }
  }

  private function deleteProductToSchedule($scheduleId, $products){
      //deleting bidproduct
    $existingProductId = array();
    if($products != null){
      foreach($products as $item){
        $productToScheduleData = $item;
        if(isset($productToScheduleData['id'])){
          $existingProductId[] = $productToScheduleData['id'];
        }
      }
    }

    if($existingProductId == null){ //delete all product order associated with this order
      $productToSchedule = TransportScheduleProduct::with('transportschedule')
                ->whereHas('transportschedule', function($query) use ($scheduleId)
                {
                    $query->where('id', '=', $scheduleId);

                })
                ->delete();
    } else { //delete product order that is included in array
      $productToSchedule = TransportScheduleProduct::with('transportschedule')
                ->whereHas('transportschedule', function($query) use ($scheduleId)
                {
                    $query->where('id', '=', $scheduleId);

                })
                ->whereNotIn('id',$existingProductId)
                ->delete();
    }
    return $productToSchedule;
  }

  public function deleteTransportSchedule($id){
    $transportschedule = TransportSchedule::find($id);

    if($transportschedule){
      $transportschedule->delete();

      $response = Response::json(array(
          'error' => false,
          'message' => 'Schedule successfully deleted.'),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => "Schedule not found"),
          200
      );
    }

    return $response;
  }
  
  public function validate($data, $entity)
  {
      $validator = Validator::make($data, $entity::$rules);
      
      if($validator->fails()) { 
          throw new ValidationException($validator); 
      }
      
      return true;
  }


  public function instance($data = array())
  {
    return new TransportSchedule($data);
  }



  public function getProductsOfOrder($order_id){
    $orderproducts = ProductOrder::where('order_id', '=', $order_id)->get();
    return $orderproducts->toArray();
  }

  private function displayLastQuery(){
    $queries = DB::getQueryLog();
    $last_query = end($queries);
    var_dump($last_query);
  }

}
