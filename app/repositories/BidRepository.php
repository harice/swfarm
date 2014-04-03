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
    //$date = isset($params['date']) ? $params['date'] : date('Y-m-d'); //default date is the present date
    $offset = $page*$perPage-$perPage;


    // $count = Bid::where('created_at', 'like', $date.'%')
    //               ->count();
     $count = Bid::count();

    $bidList = Bid::with('bidproduct')
                  ->with('account')
                  ->with('bidproduct.product')
                  ->with('destination')
                  ->with('address')
                  ->with('address.addresscity')
                  ->with('address.addressstates')
                  ->with('address.addressType')
                  ->with('address.account')
                  //->where('created_at', 'like', $date.'%')
                  ->take($perPage)->offset($offset)
                  ->orderBy($sortby, $orderby)
                  ->get();
   
    return Response::json(array(
      'data'=>$bidList->toArray(),
      'total'=>$count
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
      //$bid->bidnumber = null;
      $bid->destination_id = isset($data['destination']) ? $data['destination'] : null;
      $bid->producer_id = isset($data['producer']) ? $data['producer'] : null;
      $bid->address_id = isset($data['address']) ? $data['address'] : null;
      $bid->user_id = Auth::user()->id; //user that is currently log in
      $bid->status = 'Open';
      $bid->notes = isset($data['notes']) ? $data['notes'] : null;

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
      // $temp = array();
      $bidProductList = array();

      if(isset($data['products'])){
        $bidProductRules = array(
          'products' => 'required',
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
    // $perPage  = isset($_search['perpage']) ? $_search['perpage'] : Config::get('constants.USERS_PER_LIST');
    // $page     = isset($_search['page']) ? $_search['page'] : 1;
    // $sortby   = isset($_search['sortby']) ? $_search['sortby'] : 'name';
    // $orderby  = isset($_search['orderby']) ? $_search['orderby'] :'ASC';
    // $offset   = $page * $perPage - $perPage;

    
    //   $searchWord = $_search['search'];
      

    //   $_cnt = Account::with('accounttype')->where(function ($query) use ($searchWord){
    //                     $query->orWhere('name','like','%'.$searchWord.'%')
    //                           ->orWhere('website','like','%'.$searchWord.'%')
    //                           ->orWhere('description','like','%'.$searchWord.'%');
    //                   });

    //   $_account = Account::with('accounttype')->where(function ($query) use ($searchWord){
    //                     $query->orWhere('name','like','%'.$searchWord.'%')
    //                           ->orWhere('website','like','%'.$searchWord.'%')
    //                           ->orWhere('description','like','%'.$searchWord.'%');
    //                   });

    //   if(isset($_search['filter']) && $_search['filter'] != ''){
    //     $searchFilter = $_search['filter']; //for filter
    //     $_cnt = $_cnt->where(function ($query) use ($searchFilter){
    //                       $query->where('accounttype', '=', $searchFilter);
    //                     });
    //     $_account = $_account->where(function ($query) use ($searchFilter){
    //                       $query->where('accounttype', '=', $searchFilter);
    //                     });
    //   }

    //   $_cnt = $_cnt->count();
    //   $_account = $_account->take($perPage)
    //                   ->offset($offset)
    //                   ->orderBy($sortby, $orderby)
    //                   ->get();
    
    // return Response::json(array(
    //   'data' => $_account->toArray(), 
    //   'total' => $_cnt),
    //   200);
  }

  public function destroy($id){
    // $account = Account::find($id);

    // if($account){
    //   $account->delete();

    //   $response = Response::json(array(
    //       'error' => false,
    //       'message' => 'Account successfully deleted.',
    //       'account' => $account->toArray()),
    //       200
    //   );
    // } else {
    //   $response = Response::json(array(
    //       'error' => true,
    //       'message' => "Account not found"),
    //       200
    //   );
    // }

    // return $response;
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
