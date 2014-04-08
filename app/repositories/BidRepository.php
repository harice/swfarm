<?php
 
class BidRepository implements BidRepositoryInterface {

  public function findAll(){
    $bid = Bid::all();

    return Response::json(
        $bid->toArray(),
        200
      );
  }

  public function findById($id){
    $bid = Bid::with('bidproduct')
              ->with('account')
              ->with('bidproduct.product')
              ->with('destination')
              ->with('address')
              ->with('address.addresscity')
              ->with('address.addressstates')
              ->with('address.addressType')
              ->with('purchaseorder')
              ->find($id);          

    if($bid){
      $response = Response::json(
        $bid->toArray(),
        200
      );
    } else {
      $response = Response::json(array(
        'error' => true,
        'message' => "Bid not found"),
        200
      );
    }

    return $response;
  }

  public function paginate($params){
    $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST'); //default to 10 items, see app/config/constants
    $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
    $sortby = isset($params['sortby']) ? $params['sortby'] : 'created_at'; //default sort to account name
    $orderby = isset($params['orderby']) ? $params['orderby'] : 'DESC'; //default order is Ascending
    $date = isset($params['date']) ? $params['date'] : null; //default date is the present date
    $offset = $page*$perPage-$perPage;

    $bidList = Bid::with(
                    'bidproduct', 
                    'account', 
                    'bidproduct.product', 
                    'destination', 
                    'address', 
                    'address.addresscity', 
                    'address.addressstates', 
                    'address.addressType', 
                    'address.account')
                  ->take($perPage)
                  ->offset($offset)
                  ->orderBy($sortby, $orderby);

    if($date != null){
      $bidList = $bidList->where('created_at', 'like', $date.'%'); 
      $count = Bid::where('created_at', 'like', $date.'%')->count();
    } else {
      $count = Bid::count();
    }

    $bidList = $bidList->get();             

    return Response::json(array(
      'total'=>$count,
      'data'=>$bidList->toArray()
      
    ));

  }

  public function getPurchaseOrder($params){
    $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST'); //default to 10 items, see app/config/constants
    $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
    $sortby = isset($params['sortby']) ? $params['sortby'] : 'po_date'; //default sort to account name
    $orderby = isset($params['orderby']) ? $params['orderby'] : 'DESC'; //default order is Ascending
    $date = isset($params['date']) ? $params['date'] : null; //default date is the present date
    $offset = $page*$perPage-$perPage;

    $poList = Bid::with(
                    'bidproduct', 
                    'account', 
                    'bidproduct.product', 
                    'destination', 
                    'address', 
                    'address.addresscity', 
                    'address.addressstates', 
                    'address.addressType', 
                    'address.account',
                    'purchaseorder');

    $poList = $poList->whereNotNull('ponumber')
                  ->take($perPage)
                  ->offset($offset)
                  ->orderBy($sortby, $orderby);

    if($date != null){
      $poList = $poList->where('po_date', 'like', $date.'%'); 
      $count = Bid::whereNotNull('ponumber')->where('po_date', 'like', $date.'%')->count();
    } else {
      $count = Bid::whereNotNull('ponumber')->count();
    }

    $poList = $poList->get();             

    return Response::json(array(
      'total'=>$count,
      'data'=>$poList->toArray()
    ));
  }

  public function store($data){
    $rules = array(
      'producer' => 'required',
      'address' => 'required',
      'destination' => 'required'
    );

    $data['isPO'] = isset($data['purchaseorder']) ? true : false;

    $this->validate($data, $rules);

    $bid = DB::transaction(function() use ($data){
      $bid = new Bid;
      $bid->destination_id = isset($data['destination']) ? $data['destination'] : null;
      $bid->producer_id = isset($data['producer']) ? $data['producer'] : null;
      $bid->address_id = isset($data['address']) ? $data['address'] : null;
      $bid->user_id = Auth::user()->id; //user that is currently log in
      $bid->status = 'Open';
      $bid->notes = isset($data['notes']) ? $data['notes'] : null;
      $bid->bidnumber = $this->generateBidNumber(); //creating bid number
      if($data['isPO']){
        $bid->ponumber = $this->generatePurchaseOrderNumber(); //creating bid number  
        $bid->status = 'Closed';
        $bid->po_status = 'Open';
        $bid->po_date = date('Y-m-d H:i:s');
      }
      $bid->save();


      if(isset($data['products'])){
        $bidProductRules = array(
          'product' => 'required',
          'stacknumber' => 'required',
          'bidprice' => 'required',
          'tons' => 'required_without:bales',
          'bales' => 'required_without:tons'
        );

        foreach($data['products'] as $item){
          // $bidProductData = (array)json_decode($item);
          $bidProductData = $item;
          $this->validate($bidProductData, $bidProductRules);

          $bid->product()->attach($bidProductData['product'], array(
              'stacknumber' => $bidProductData['stacknumber'],
              'bidprice' => $bidProductData['bidprice'],
              'bales' => $bidProductData['bales'],
              'tons' =>  $bidProductData['tons'],
              'ishold' => isset($bidProductData['ishold']) ? $bidProductData['ishold']: false,
            ));
        }
      }

      return $bid->id;
    });

    return Response::json(array(
        'error' => false,
        'message' => 'Bid successfully created.',
        'bidId' => $bid),
        200
    );
  }

  private function generateBidNumber(){
    $dateToday = date('Y-m-d');
    $count = Bid::where('created_at', 'like', $dateToday.'%')->count()+1;
    
    return 'B'.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
  }

  private function generatePurchaseOrderNumber(){
    $dateToday = date('Y-m-d');
    $count = Bid::whereNotNull('ponumber')->where('created_at', 'like', $dateToday.'%')->count()+1;
    
    return 'P'.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
  }

  public function update($id, $data){
    $rules = array(
      'producer' => 'required',
      'address' => 'required',
      'destination' => 'required'
    );

    $data['isPO'] = isset($data['purchaseorder']) ? true : false;

    $this->validate($data, $rules);


    $result = DB::transaction(function() use ($id, $data){
        $bid = Bid::find($id);

        if(strcmp($bid->status, 'Closed') == 0 || strcmp($bid->status, 'Cancelled') == 0){
          return array(
            'error' => true,
            'message' => 'Bid cannot be updated because the status is already cancelled/closed.');
        }

        $bid->destination_id = isset($data['destination']) ? $data['destination'] : null;
        $bid->producer_id = isset($data['producer']) ? $data['producer'] : null;
        $bid->address_id = isset($data['address']) ? $data['address'] : null;
        $bid->user_id = Auth::user()->id; //user that is currently log in
        $bid->status = 'Open';
        $bid->notes = isset($data['notes']) ? $data['notes'] : null;
        if($data['isPO']){
          $bid->ponumber = $this->generatePurchaseOrderNumber(); //creating bid number  
          $bid->status = 'Closed';
          $bid->po_status = 'Open';
          $bid->po_date = date('Y-m-d H:i:s');
        }
        $bid->save();
        
        $bidProductList = array();

        if(isset($data['products'])){
          $bidProductRules = array(
            'product' => 'required',
            'stacknumber' => 'required',
            'bidprice' => 'required',
            'tons' => 'required_without:bales',
            'bales' => 'required_without:tons'
          );

          //deleting bidproduct
          $existingBidProductId = array();

          foreach($data['products'] as $item){
            $bidProductData = $item;
            if(isset($bidProductData['id'])){
              $existingBidProductId[] = $bidProductData['id'];
            }
          }
      
          $this->deleteBidProduct($bid->id, $existingBidProductId); //delete addresses that is not pass excluding the new addresses

          foreach($data['products'] as $item){
            $bidProductData = $item;
            $this->validate($bidProductData, $bidProductRules);
            
            if(isset($bidProductData['id'])){
              $bidproduct = BidProduct::find($bidProductData['id']);
            } else {
              $bidproduct = new BidProduct;
            }
            $bidproduct->bid_id = $bid->id;
            $bidproduct->product_id = $bidProductData['product'];
            $bidproduct->stacknumber = $bidProductData['stacknumber'];
            $bidproduct->bidprice = $bidProductData['bidprice'];
            $bidproduct->bales = $bidProductData['bales'];
            $bidproduct->tons = $bidProductData['tons'];
            $bidproduct->ishold = isset($bidProductData['ishold']) ? $bidProductData['ishold']: false;

            $bidproduct->save();
          }
        }

        return array(
            'error' => false,
            'message' => 'Bid successfully updated.');
    });

    return Response::json(array(
        'error' => $result['error'],
        'message' => $result['message']),
        200
    );
  }

  private function deleteBidProduct($bid, $bidIdList = null){
    if($bidIdList == null){
      $bidproduct = BidProduct::with('bid')
                ->whereHas('bid', function($query) use ($bid)
                {
                    $query->where('id', '=', $bid);

                })
                ->delete();
    } else {
      $bidproduct = BidProduct::with('bid')
                ->whereHas('bid', function($query) use ($bid)
                {
                    $query->where('id', '=', $bid);

                })
                ->whereNotIn('id',$bidIdList)
                ->delete();
    }
    return $bidproduct;
  }


  public function search($_search)
  { 
    $perPage  = isset($_search['perpage']) ? $_search['perpage'] : Config::get('constants.USERS_PER_LIST');
    $page     = isset($_search['page']) ? $_search['page'] : 1;
    $sortby   = isset($_search['sortby']) ? $_search['sortby'] : 'created_at';
    $orderby  = isset($_search['orderby']) ? $_search['orderby'] :'ASC';
    $bidStatus = isset($_search['bidStatus']) ? $_search['bidStatus'] : null;
    $date = isset($_search['date']) ? $_search['date'] : null;
    $destination = isset($_search['destination']) ? $_search['destination'] : null;
    $offset   = $page * $perPage - $perPage;

    $searchWord = isset($_search['search']) ? $_search['search'] : '';

    $count = Bid::where(function($query) use ($searchWord){
                     $query->orWhereHas('account', function($query) use ($searchWord){
                          $query->where('name', 'like', '%'.$searchWord.'%');

                      })
                      ->orWhereHas('destination', function($query) use ($searchWord){
                          $query->where('destination', 'like', '%'.$searchWord.'%');

                      })
                      ->orWhere(function ($query) use ($searchWord){
                          $query->orWhere('bidnumber','like','%'.$searchWord.'%');
                      });
                  })
                  ->whereNull('deleted_at');

    $bid = Bid::with('bidproduct', 
                      'account', 
                      'bidproduct.product', 
                      'destination', 
                      'address', 
                      'address.addresscity', 
                      'address.addressstates', 
                      'address.addressType', 
                      'address.account')
                  ->where(function($query) use ($searchWord){
                     $query->orWhereHas('account', function($query) use ($searchWord){
                          $query->where('name', 'like', '%'.$searchWord.'%');

                      })
                      ->orWhereHas('destination', function($query) use ($searchWord){
                          $query->where('destination', 'like', '%'.$searchWord.'%');

                      })
                      ->orWhere(function ($query) use ($searchWord){
                          $query->orWhere('bidnumber','like','%'.$searchWord.'%');
                      });
                  })
                  ->whereNull('deleted_at');

      if($bidStatus !=  null){ //bidStatus can only be "Open" or "Closed"
        $count = $count->where(function ($query) use ($bidStatus){
                          $query->where('status', '=', $bidStatus);
                        });
        $bid = $bid->where(function ($query) use ($bidStatus){
                          $query->where('status', '=', $bidStatus);
                        });
      }

      if($destination !=  null){ //value pass must be id of destination, check the lookup table for destination
        $count = $count->where(function ($query) use ($destination){
                          $query->where('destination_id', '=', $destination);
                        });
        $bid = $bid->where(function ($query) use ($destination){
                          $query->where('destination_id', '=', $destination);
                        });
      }

      if($date !=  null){
        $count = $count->where(function ($query) use ($date){
                          $query->where('created_at', 'like', $date.'%');
                        });
        $bid = $bid->where(function ($query) use ($date){
                          $query->where('created_at', 'like', $date.'%');
                        });
      }

      $count = $count->count();
      $bid = $bid->take($perPage)
                      ->offset($offset)
                      ->orderBy($sortby, $orderby)
                      ->get();
    
    return Response::json(array(
      'total' => $count,
      'data' => $bid->toArray()
      ),
      200);
  }

  public function destroy($id){
    $bid = Bid::find($id);

    if($bid){
      $bid->delete();

      $response = Response::json(array(
          'error' => false,
          'message' => 'Bid successfully deleted.'),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => "Bid not found"),
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
    return new Bid($data);
  }

  public function getProducerAccount($search){
    $producers = Account::where('accounttype', '=', 5)
                  ->where('name','like', '%'.$search.'%')
                  ->orderBy('name', 'asc')
                  ->get();

    return Response::json(
          $producers->toArray(),
          200
      );
  }

  public function getProducerAddress($producerId){
    $addresses = Address::with('addressType')
                  ->with('addressCity')
                  ->with('addressStates')
                  ->where('account', '=', $producerId)
                  ->get();

    return Response::json(
          $addresses->toArray(),
          200
      );
  }

  public function getDestination(){
    $destination = Destination::all();

    return Response::json(
          $destination->toArray(),
          200
      );
  }

  public function createPurchaseOrder($data){
    $rules = array(
      'bidId' => 'required',
      'pickupstart' => 'required|date',
      'pickupend' => 'required|date'
    );

    $this->validate($data, $rules);

    DB::transaction(function() use ($data){
      $purchaseOrder = new PurchaseOrder;
      $purchaseOrder->bid_id = $data['bidId'];
      $purchaseOrder->pickupstart = $data['pickupstart'];
      $purchaseOrder->pickupend = $data['pickupend'];
      $purchaseOrder->save();

      $bid = Bid::find($data['bidId']);
      $bid->po_status = "Open";
      $bid->notes =  isset($data['notes']) ? $data['notes'] : '';
      $bid->save();

      foreach($data['products'] as $bidProductData){
        $bidproduct = BidProduct::find($bidProductData['id']);
        $bidproduct->unitprice = isset($bidProductData['unitprice']) ? $bidProductData['unitprice'] : null;
        $bidproduct->save();
      }
    });

    return Response::json(array(
          'error' => false,
          'message' => 'Purchase order successfully created.'),
          200
      );
  }

  public function addPickupDateToPurchaseOrder($bidId, $data){
     $rules = array(
      'pickupstart' => 'required|date',
      'pickupend' => 'required|date'
    );

    $this->validate($data, $rules);

    DB::transaction(function() use ($bidId, $data){
      $purchaseOrder = PurchaseOrder::where('bid_id', '=', $bidId)->first();

      if($purchaseOrder == null){
        $purchaseOrder = new PurchaseOrder;
        $purchaseOrder->bid_id = $bidId;
      }
      
      $purchaseOrder->pickupstart = $data['pickupstart'];
      $purchaseOrder->pickupend = $data['pickupend'];
      $purchaseOrder->save();

      $bid = Bid::find($bidId);
      $bid->notes =  isset($data['notes']) ? $data['notes'] : '';
      $bid->save();
    });

    return Response::json(array(
          'error' => false,
          'message' => 'Pick up date added successfully.'),
          200
      );
  }

  public function addUnitPriceToBidProduct($bidId, $data){
    try{
      foreach($data['products'] as $bidProductData){
        // $bidproduct = BidProduct::find($bidProductData['id']);
        $bidproduct = BidProduct::where('id', '=', $bidProductData['id'])
                                ->where('bid_id', '=', $bidId)
                                ->first();
        $bidproduct->unitprice = isset($bidProductData['unitprice']) ? $bidProductData['unitprice'] : null;
        $bidproduct->save();
      }
    } catch(Exception $e){
      return Response::json(array(
        'error' => true,
        'message' => "Please check the parameters."),
        200
      );
    }
      return Response::json(array(
          'error' => false,
          'message' => 'Products unit price successfully updated.'),
          200
      );
  }

  public function cancelPurchaseOrder($bidId){
    $bid = Bid::find($bidId);
    $bid->po_status = "Cancelled";
    $bid->save();

    return Response::json(array(
          'error' => false,
          'message' => 'Purchase order cancelled.'),
          200
      );
  }

  public function cancelBid($bidId){
    $bid = Bid::find($bidId);
    $bid->status = "Cancelled";
    $bid->save();

    return Response::json(array(
          'error' => false,
          'message' => 'Bid cancelled.'),
          200
      );
  }


}
