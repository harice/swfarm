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
                  // ->join('destination', 'bid.destination_id', '=', 'destination.id')
                  ->take($perPage)
                  ->offset($offset)
                  ->orderBy('created_at', $orderby);

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

  public function store($data){
    $rules = array(
      'producer' => 'required',
      'address' => 'required',
      'destination' => 'required'
    );


    $this->validate($data, $rules);

    DB::transaction(function() use ($data){
      $bid = new Bid;
      $bid->destination_id = isset($data['destination']) ? $data['destination'] : null;
      $bid->producer_id = isset($data['producer']) ? $data['producer'] : null;
      $bid->address_id = isset($data['address']) ? $data['address'] : null;
      $bid->user_id = Auth::user()->id; //user that is currently log in
      $bid->status = 'Open';
      $bid->notes = isset($data['notes']) ? $data['notes'] : null;

      $bid->save();
      
      $bid->bidnumber = $this->generateBidId(); //creating bid number
      $bid->save();

      if(isset($data['products'])){
        $bidProductRules = array(
          'product' => 'required',
          'stacknumber' => 'required',
          'bidprice' => 'required',
          'tons' => 'required',
          'bales' => 'required'
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
    });

    return Response::json(array(
        'error' => false,
        'message' => 'Bid successfully created.'),
        200
    );
  }

  private function generateBidId(){
    $dateToday = date('Y-m-d');
    $count = Bid::where('created_at', 'like', $dateToday.'%')->count();
    
    return 'B'.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
  }

  public function update($id, $data){
    $rules = array(
      'producer' => 'required',
      'address' => 'required',
      'destination' => 'required'
    );

    $this->validate($data, $rules);


    DB::transaction(function() use ($id, $data){
      $bid = Bid::find($id);
      $bid->destination_id = isset($data['destination']) ? $data['destination'] : null;
      $bid->producer_id = isset($data['producer']) ? $data['producer'] : null;
      $bid->address_id = isset($data['address']) ? $data['address'] : null;
      $bid->user_id = Auth::user()->id; //user that is currently log in
      $bid->status = 'Open';
      $bid->notes = isset($data['notes']) ? $data['notes'] : null;

      $bid->save();
      
      $bidProductList = array();

      if(isset($data['products'])){
        $bidProductRules = array(
          'product' => 'required',
          'stacknumber' => 'required',
          'bidprice' => 'required',
          'tons' => 'required',
          'bales' => 'required'
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
    });

    return Response::json(array(
        'error' => false,
        'message' => 'Bid successfully updated.'),
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

    $searchWord = $_search['search'];

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


}
