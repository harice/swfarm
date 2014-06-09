<?php
 
class TransportScheduleRepository implements TransportScheduleRepositoryInterface {

  public function getSchedule($id){ //default sked is pickup
      $transportSchedule = TransportSchedule::with('trucker')
                        ->with('originloader')
                        ->with('destinationloader')
                        ->with('trucker.accountidandname.accounttype')
                        ->with('originloader.accountidandname')
                        ->with('destinationloader.accountidandname')
                        ->with('trailer.account')
                        ->with('transportscheduleproduct.productorder.product')
                        ->where('id', '=', $id)->first();
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
                      ->with('originloader')
                      ->with('destinationloader')
                      ->with('trucker.accountidandname.accounttype')
                      ->with('originloader.accountidandname')
                      ->with('destinationloader.accountidandname')
                      ->with('trailer.account')
                      ->with('transportscheduleproduct.productorder.product')
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
      $this->validate($data, 'TransportSchedule');
      
      $result = DB::transaction(function() use ($data, $transportScheduleId){
          if($transportScheduleId == null)
              $transportschedule = new TransportSchedule;
          else
              $transportschedule = TransportSchedule::find($transportScheduleId);

          //convert pass date parameters to timestamp
          $data['scheduletimeMin'] = str_pad($data['scheduletimeMin'], 2, '0', STR_PAD_LEFT); //adding leading zero
          $data['date'] = Date('Y-m-d H:i:s', strtotime($data['scheduledate'].' '.$data['scheduletimeHour'].':'.$data['scheduletimeMin'].' '.$data['scheduletimeAmPm']));
          //$data['truckingrate'] = isset($data['truckingrate']) ? $data['truckingrate'] : Config::get('constants.GLOBAL_PER_LIST');
          $data['type'] = isset($data['type']) ? $data['type'] : 1;
          // $data['trailerrate'] = isset($data['trailerrate']) ? $data['trailerrate'] : null;
          $data['status_id'] = 1; //open status - default
          $trailerPercentageRateArr = Settings::where('name','=','trailer_percentage_rate')->first(array('value'))->toArray();
          $trailerPercentageRate = floatval($trailerPercentageRateArr['value'])/100; //get trailer perentage and convert it to decimal
          $data['trailerrate'] = $trailerPercentageRate * $data['truckingrate'];

          //computations
          // if($data['truckerAccountType_id'] == 2){ //for hauler account type only
          //     $trailerPercentageRateArr = Settings::where('name','=','trailer_percentage_rate')->first(array('value'))->toArray();
          //     $trailerPercentageRate = floatval($trailerPercentageRateArr['value'])/100; //get trailer perentage and convert it to decimal
          //     $data['trailerrate'] = $trailerPercentageRate * $data['truckingrate'];
          // } else 
          if($data['truckerAccountType_id'] == 9) { //for SFS account type
              $freightRateArr = Settings::where('name','=','freight_rate')->first(array('value'))->toArray();
              $freightRate = floatval($freightRateArr['value']);

              $loadingRateArr = Settings::where('name','=','loading_rate')->first(array('value'))->toArray();
              $loadingRate = floatval($loadingRateArr['value']);

              $unloadingRateArr = Settings::where('name','=','unloading_rate')->first(array('value'))->toArray();
              $unloadingRate = floatval($unloadingRateArr['value']);

              $totalWeight = $this->getTotalWeightOfSchedule($data['products']);
              $data['truckingrate'] = ($freightRate * $data['distance'] + ($loadingRate + $unloadingRate))/$totalWeight;
          } 

          $transportschedule->fill($data);
          $transportschedule->save();

          //when updating only
          if($transportScheduleId != null){
              $this->deleteProductToSchedule($transportschedule->id, $data['products']);
          }

          $addProductResult = $this->addProductToSchedule($transportschedule->id, $data['products']);
          if($addProductResult != false){
            return $addProductResult;
          }
          return $transportschedule->id;
      });
      
      if(is_array($result)){
        return $result;
      }

      if($transportScheduleId == null){
          $message = 'Schedule successfully created.';
      } else {
          $message = 'Schedule successfully updated.';
      }

      return array(
          'error' => false,
          'message' => $message);
  }

  private function getTotalWeightOfSchedule($products){
      $totalWeightInTons = 0;
      foreach ($products as $product) {
            $totalWeightInTons += floatval($product['quantity']);
      }

      return $totalWeightInTons;
  }

  private function getTotalWeightScheduleForProduct($productorder_id){
      $totalWeight = ProductOrder::where('id', '=', $productorder_id)->first()->toArray();
      $orderproducts = TransportScheduleProduct::where('productorder_id', '=', $productorder_id)->get()->toArray();
      $totalQuantitySchedule = 0;
      foreach($orderproducts as $item){
          $totalQuantitySchedule += $item['quantity'];
      }

      return floatval($totalWeight['tons']) - $totalQuantitySchedule; //total weight remaining to be scheduled
  }

  private function addProductToSchedule($schedule_id, $products = array())
  {
      foreach ($products as $product) {
          $product['transportschedule_id'] = $schedule_id;

          $this->validate($product, 'TransportScheduleProduct');

          $totalQuantityRemaining = $this->getTotalWeightScheduleForProduct($product['productorder_id']);

          if(floatval($product['quantity']) > $totalQuantityRemaining){
              return array(
                      'error' => true,
                      'message' => "Quantity Error!");
          }

          $result = DB::transaction(function() use ($product){
              if(isset($product['id']))
                  $transportscheduleproduct = TransportScheduleProduct::find($product['id']);
              else
                  $transportscheduleproduct = new TransportScheduleProduct();

              $transportscheduleproduct->fill($product);
              $transportscheduleproduct->save();
          });
      }

      return false;
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

        $response = array(
            'error' => false,
            'message' => 'Schedule successfully deleted.');
      } else {
        $response = array(
            'error' => true,
            'message' => "Schedule not found");
      }

      return $response;
  }
  
  public function validate($data, $entity){
      $validator = Validator::make($data, $entity::$rules);
      
      if($validator->fails()) { 
          throw new ValidationException($validator); 
      }
      
      return true;
  }


  public function instance($data = array()){
      return new TransportSchedule($data);
  }



  public function getProductsOfOrder($order_id){
      $orderproducts = ProductOrder::with('product')->where('order_id', '=', $order_id)->get();
      $productOrder = $orderproducts->toArray();
      $result = array();

      foreach($productOrder as $item){
        $transportProduct = TransportScheduleProduct::where('productorder_id','=',$item['id'])->get();
        $scheduleQuantity = 0;

        foreach($transportProduct as $product){
            $scheduleQuantity += $product->quantity;
        }

        $item['quantityRemaining'] = $item['tons'] - $scheduleQuantity;
        array_push($result, $item);
        // var_dump('TOtal: '.$item['tons'].' Remaining: '.$item['quantityRemaining']);
      }

      return $result;
  }

  // public function getTrailerList(){
  //   return Trailer::all();
  // }


  public function getTrailerList($accountId){
      $trailerList = Trailer::whereHas('Account', function($query) use ($accountId){
                    $query->where('id', '=', $accountId);
                  })->get(array('id','account_id','number','rate'));
    
    return $trailerList->toArray();
  }

  public function closeTransportSchedule($transportSchedule_id){
    // $transportSchedule = TransportSchedule::whereHas('weightticket', function ($query) use (){
      
    // });


    //   $weightTicket = WeightTicket::where('transportSchedule_id', '=', $transportSchedule_id)->first();
      
    //   if($weightTicket->status_id == 1){ //check if Open
    //         $weightTicket->status_id = 2;
    //         $weightTicket->save();

    //         return array(
    //             'error' => false,
    //             'message' => 'Weight ticket closed.');
    //   } else if($weightTicket->status_id == 2) {//if close
    //         return array(
    //             'error' => false,
    //             'message' => 'Weight ticket is already closed.');
    //   } else {
    //         return array(
    //             'error' => false,
    //             'message' => 'Weight ticket cannot be cancel if the status is not open or pending.');
    //   }       
  }

  private function displayLastQuery(){
      $queries = DB::getQueryLog();
      $last_query = end($queries);
      var_dump($last_query);
  }

}
