<?php
 
class TransportScheduleRepository implements TransportScheduleRepositoryInterface {

  public function getSchedule($id){ //default sked is pickup
      $transportSchedule = TransportSchedule::with('trucker')
                        ->with('status')
                        ->with('originloader')
                        ->with('destinationloader')
                        ->with('transportmap')
                        ->with('trucker.accountidandname.accounttype')
                        ->with('truckvehicle')
                        ->with('originloader.accountidandname')
                        ->with('destinationloader.accountidandname')
                        ->with('trailer.account')
                        ->with('transportscheduleproduct.productorder.product')
                        ->with('weightticket')
                        ->with('weightticket.status')
                        ->with('transportscheduleproduct.sectionto.storagelocation')
                        ->where('id', '=', $id)->first();
      if($transportSchedule){
          $transportSchedule = $transportSchedule->toArray();
          //get map data
          if(isset($transportSchedule['transportmap'])){
              $transportSchedule['mapData'] = $this->getTotalLoadedDistance($transportSchedule['transportmap']);
          }
          return $transportSchedule;
        
      } else {
          return array(
            'error' => true,
            'message' => "Schedule not found.");
      }
  }

  private function getTotalLoadedDistance($mapData){
       $totalLoadedDistance = 0;
       $totalDistance = 0;
       foreach($mapData as $item){
          if($item['isLoadedDistance']){
              $totalLoadedDistance += $item['distance'];
          }
          $totalDistance += $item['distance'];
       }
       return array('totalLoadedDistance' => $totalLoadedDistance, 'totalDistance' => $totalDistance);
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
                ->with('status')
                ->with('originloader')
                ->with('destinationloader')
                ->with('trucker.accountidandname.accounttype')
                ->with('truckvehicle')
                ->with('originloader.accountidandname')
                ->with('destinationloader.accountidandname')
                ->with('trailer.account')
                ->with('transportscheduleproduct.productorder.product')
                ->with('weightticket')
                ->with('transportscheduleproduct.sectionto.storagelocation')
                ->where('order_id', '=', $orderId)
                ->where('type', '=', $scheduleType)
                ->orderBy($sortby,$orderby)
                ->paginate($perPage);

      return $transportSchedules;
  }

  public function addOrUpdateTransportSchedule($data, $transportScheduleId = null){
      $this->validate($data, 'TransportSchedule');
      DB::beginTransaction();
          if(!$this->checkIfAllowedToCreateSchedule($data['order_id'])){
              return Response::json(array('error' => true, 'message' => 'Cannot create schedule if destination of order is not Southwest Farms'), 500);
          }
      // $result = DB::transaction(function() use ($data, $transportScheduleId){
          if($transportScheduleId == null)
              $transportschedule = new TransportSchedule;
          else
              $transportschedule = TransportSchedule::find($transportScheduleId);

          //convert pass date parameters to timestamp
          $data['scheduletimeMin'] = str_pad($data['scheduletimeMin'], 2, '0', STR_PAD_LEFT); //adding leading zero
          $data['date'] = Date('Y-m-d H:i:s', strtotime($data['scheduledate'].' '.$data['scheduletimeHour'].':'.$data['scheduletimeMin'].' '.$data['scheduletimeAmPm']));
          $data['type'] = isset($data['type']) ? $data['type'] : 1;
          $data['status_id'] = 1; //open status - default
          $trailerPercentageRateArr = Settings::where('name','=','trailer_percentage_rate')->first(array('value'))->toArray();
          $trailerPercentageRate = floatval($trailerPercentageRateArr['value'])/100; //get trailer perentage and convert it to decimal
          $data['trailerrate'] = $trailerPercentageRate * $data['truckingrate'];

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
              $isAddOperation = false;
          } else {
              $isAddOperation = true;
          }

          $ordertype = $this->getOrderType($data['order_id']);
          
          $addProductResult = $this->addProductToSchedule($transportschedule->id, $data['products'], $ordertype);
          if($addProductResult != false){
            DB::rollback();
            return Response::json($addProductResult, 500);
          }
         
         //save schedule map points
          if(isset($data['scheduleMap'])){
              if(!$this->saveMapPointsForSchedule($transportschedule->id, $data['scheduleMap'], $isAddOperation)){
                DB::rollback();
                return Response::json(array('error' => true, 'message' => 'Problem encountered during adding map data.'), 500);
              }
          }
          

      DB::commit();

      // if(is_array($result)){
      //   return Response::json($result, 500);
      // }

      if($transportScheduleId == null){
          $message = 'Schedule successfully created.';
      } else {
          $message = 'Schedule successfully updated.';
      }

      return Response::json(array(
          'error' => false,
          'message' => $message), 200);
  }

  private function saveMapPointsForSchedule($transportscheduleId, $scheduleMapData, $isAddOperation = true){
      //when update operation only
      if(!$isAddOperation){
          $clearMapData = false;
          foreach($scheduleMapData as $item){
            if(isset($item['id'])){
              continue;
            } else {
              $clearMapData = true;
              break;
            }
          }

          if($clearMapData){
              $transportMap = TransportMap::where('transportschedule_id', '=', $transportscheduleId)->delete();
              $sequenceNo = 1;
              foreach($scheduleMapData as $item){
                  $transportMap = new TransportMap;
                  $item['transportschedule_id'] = $transportscheduleId;
                  $item['sequenceNo'] = $sequenceNo;
                  if($item['isLoadedDistance'] == '1'){
                      $item['isLoadedDistance'] = true;
                  }
                  $transportMap->fill($item);
                  $transportMap->save();

                  $sequenceNo++;
              }
          }
      } else {
          $sequenceNo = 1;
          foreach($scheduleMapData as $item){
              $transportMap = new TransportMap;
              $item['transportschedule_id'] = $transportscheduleId;
              $item['sequenceNo'] = $sequenceNo;
              if($item['isLoadedDistance'] == '1'){
                  $item['isLoadedDistance'] = true;
              }
              $transportMap->fill($item);
              $transportMap->save();

              $sequenceNo++;
          }
      }

      return true;
  }

  private function checkIfAllowedToCreateSchedule($orderId){
      $result = Order::where('id', '=', $orderId)->first(array('id', 'location_id', 'ordertype'));
      $bool = true;
      if($result){
        //cannot create schedule if the location of order is dropship  or producer
          if($result->ordertype == 1 && ($result->location_id == 3 || $result->location_id == 2)){
              $bool = false; 
          }
      }
      return $bool;
  }

  private function getOrderType($orderId){
      $result = Order::where('id', '=', $orderId)->first(array('id','ordertype'));
      return $result->ordertype;
  }

  private function getTotalWeightOfSchedule($products){
      $totalWeightInTons = 0;
      foreach ($products as $product) {
            $totalWeightInTons += floatval($product['quantity']);
      }

      return $totalWeightInTons;
  }

  private function getTotalWeightScheduleForProduct($productorder_id, $transportscheduleproduct_id = null){
      $result = array();
      $totalWeight = ProductOrder::where('id', '=', $productorder_id)->first()->toArray();
      $orderproducts = TransportScheduleProduct::where('productorder_id', '=', $productorder_id);
      if($transportscheduleproduct_id != null){
        $orderproducts = $orderproducts->where('id', '!=', $transportscheduleproduct_id);
      }                    
      $orderproducts = $orderproducts->get()->toArray();
      $totalQuantitySchedule = 0;
      foreach($orderproducts as $item){
          $totalQuantitySchedule += $item['quantity'];
      }
      $result['totalQuantitySchedule'] = $totalQuantitySchedule;
      $result['quantityRemaining'] = floatval($totalWeight['tons']) - $totalQuantitySchedule;
      // return floatval($totalWeight['tons']) - $totalQuantitySchedule; //total weight remaining to be scheduled
      return $result; //total weight remaining to be scheduled
  }

  private function addProductToSchedule($schedule_id, $products = array(), $ordertype = null)
  {   
      if($this->checkRepeatedProductOrderUsed($products)){
          return array(
                'error' => true,
                'message' => "Cannot select the same stack number in creating a schedule.");
      }

      foreach ($products as $product) {
          $product['transportschedule_id'] = $schedule_id;

          $this->validate($product, 'TransportScheduleProduct', $ordertype);
          if(isset($product['id'])){
            $result = $this->getTotalWeightScheduleForProduct($product['productorder_id'], $product['id']);  
          } else {
            $result = $this->getTotalWeightScheduleForProduct($product['productorder_id']);
          }
          
          if(floatval($product['quantity']) > $result['quantityRemaining']){
              $productOrderDetails = ProductOrder::find($product['productorder_id']);
              return array(
                      'error' => true,
                      'message' => "Weight inputed exceeded for ".$productOrderDetails['stacknumber'].". <br />Weight already scheduled: ".number_format($result['totalQuantitySchedule'], 4)." <br />Weight remaining: ".number_format($result['quantityRemaining'], 4)." <br />Total weight allowed for this product: ".$productOrderDetails['tons']);
          }

          $result = DB::transaction(function() use ($product){
              if(isset($product['id']))
                  $transportscheduleproduct = TransportScheduleProduct::find($product['id']);
              else
                  $transportscheduleproduct = new TransportScheduleProduct();

              if($product['sectionto_id'] == ''){
                  $product['sectionto_id'] = null;
              }
              
              $transportscheduleproduct->fill($product);
              $transportscheduleproduct->save();
          });
      }

      return false;
  }

  private function checkRepeatedProductOrderUsed($stacks){
      $stacknumbersUsed = array();
      //check if same stack number is used in saving schedule
      foreach($stacks as $item){
          if(!in_array(strtolower($item['productorder_id']), $stacknumbersUsed)){
              array_push($stacknumbersUsed, strtolower($item['productorder_id'])); 
          } else {
              return true;
          }
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
      //check if has weight ticket, cannot delete schedule with a weight ticket
      if($this->checkIfScheduleHasWeightTicket($id)){
          $response = array(
              'error' => true,
              'message' => 'Cannot delete a schedule with weight ticket.');
      } else {
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
      }

      return $response;
  }

  private function checkIfScheduleHasWeightTicket($transportscheduleId){
      $weightTicketCount = WeightTicket::where('transportSchedule_id', '=', $transportscheduleId)->count();

      if($weightTicketCount > 0){
          return true;
      } else {
          return false;
      }
  }
  
  public function validate($data, $entity, $ordertype = null){
      if(strcmp($entity, 'TransportScheduleProduct') == 0){
          if($ordertype == 1){ //PO
              $validator = Validator::make($data, $entity::$po_rules);
          } else if($ordertype == 2){ //SO
              $validator = Validator::make($data, $entity::$so_rules);
          } else {
              $validator = Validator::make($data, $entity::$rules);    
          }
      } else{
          $validator = Validator::make($data, $entity::$rules);  
      }
      
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
          if($item['stacknumber'] == "" || $item['tons'] == 0){
            continue;
          }
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
    $transportSchedule = TransportSchedule::with('weightticket')->find($transportSchedule_id);
    $transportScheduleArr = $transportSchedule->toArray();
    if($transportSchedule->status_id == 2){
        return Response::json(array(
          'error' => true,
          'message' => 'Schedule is already closed.'), 500);
    }

    if($transportScheduleArr['weightticket']['status_id'] == 2){ //check if Open
          $transportSchedule->status_id = 2; //close the schedule
          $transportSchedule->save();

          return Response::json(array(
              'error' => false,
              'message' => 'Schedule successfully closed.'), 200);
    } else {
          return Response::json(array(
              'error' => false,
              'message' => 'Schedule cannot be closed because weight ticket is not yet created.'), 500);
    }       
  }

  private function displayLastQuery(){
      $queries = DB::getQueryLog();
      $last_query = end($queries);
      var_dump($last_query);
  }

}
