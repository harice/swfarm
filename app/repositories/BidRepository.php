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
    // $account = Account::with('accounttype')->with('address', 'address.addressStates', 'address.addressCity', 'address.addressType')->find($id);          

    // if($account){
    //   $response = Response::json(
    //     $account->toArray(),
    //     200
    //   );
    // } else {
    //   $response = Response::json(array(
    //     'error' => true,
    //     'message' => "Account not found"),
    //     200
    //   );
    // }

    // return $response;
  }

  public function paginate($params){
    // $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST'); //default to 10 items, see app/config/constants
    // $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
    // $sortby = isset($params['sortby']) ? $params['sortby'] : 'name'; //default sort to account name
    // $orderby = isset($params['orderby']) ? $params['orderby'] : 'ASC'; //default order is Ascending
    // $offset = $page*$perPage-$perPage;

    // //pulling of data
    // if(!isset($params['filter']) || $params['filter'] == ''){
    //   $count = Account::count();
    //   $accountList = Account::with('accounttype')
    //                 ->take($perPage)->offset($offset)
    //                 ->orderBy($sortby, $orderby)
    //                 ->get();
    // } else {
    //   $filter = $params['filter']; // accounttype id
    //   $count = Account::where(function ($query) use ($filter){
    //                     $query->where('accounttype', '=', $filter);
    //                   })->count();
    //   $accountList = Account::with('accounttype')
    //                   ->where(function ($query) use ($filter){
    //                     $query->where('accounttype', '=', $filter);
    //                   })
    //                   ->take($perPage)
    //                   ->offset($offset)
    //                   ->orderBy($sortby, $orderby)
    //                   ->get();
    // }

    // return Response::json(array(
    //   'data'=>$accountList->toArray(),
    //   'total'=>$count
    // ));

  }

  public function store($data){
    $rules = array(
      'producer' => 'required',
      'address' => 'required',
      'destination' => 'required'
    );


    $this->validate($data, $rules);

    $bid = new Bid;
    //$bid->bidnumber = null;
    $bid->destination_id = isset($data['destination']) ? $data['destination'] : null;
    $bid->producer_id = isset($data['producer']) ? $data['producer'] : null;
    $bid->address_id = isset($data['address']) ? $data['address'] : null;
    $bid->user_id = Auth::user()->id; //user that is currently log in
    $bid->status = 'Open';
    $bid->notes = isset($data['notes']) ? $data['notes'] : null;

    try{
      $bid->save();
    } catch(Exception $e){
      return Response::json(array(
        'error' => true,
        'message' => $e->errorInfo[2]),
        200
      );
    }

    if(isset($data['products'])){
      $bidProductRules = array(
        'product' => 'required',
        'stacknumber' => 'required',
        'bidprice' => 'required',
        'tons' => 'required',
        'bales' => 'required',
        'unitprice' => 'required'
      );

      foreach($data['products'] as $item){
        $bidProductData = (array)json_decode($item);
        $this->validate($bidProductData, $bidProductRules);

        $bidproduct = new BidProduct;
        $bidproduct->product_id = $bidProductData['product'];
        $bidproduct->stacknumber = $bidProductData['stacknumber'];
        $bidproduct->bidprice = $bidProductData['bidprice'];
        $bidproduct->bales = $bidProductData['bales'];
        $bidproduct->tons = $bidProductData['tons'];
        $bidproduct->unitprice = $bidProductData['unitprice'];
        $bidproduct->ishold = isset($bidProductData['ishold']) ? $bidProductData['ishold']: false;
        $bidproduct->bid_id = $bid->id;

        try{
            $bidproduct->save();
          } catch(Exception $e){
            return Response::json(array(
              'error' => true,
              'message' => $e->errorInfo[2]),
              200
            );
          }
      }
    }

    return Response::json(array(
        'error' => false,
        'message' => 'Bid successfully created.'),
        200
    );
  }

  public function update($id, $data){
    // $rules = array(
    //   'name' => 'required|unique:account,name,'.$id,
    //   'website' => 'url',
    //   'accounttype' => 'required',
    //   'phone' => 'between:1,12',
    // );


    // $this->validate($data, $rules);

    // $account = Account::find($id);
    // $account->name = $data['name'];
    // $account->website = isset($data['website']) ? $data['website'] : '';
    // $account->description = isset($data['description']) ? $data['description'] : '';
    // $account->phone = isset($data['phone']) ? $data['phone'] : '';
    // $account->accounttype = $data['accounttype'];

    // try{
    //   $account->save();
    // } catch(Exception $e){
    //   return Response::json(array(
    //     'error' => true,
    //     'message' => $e->errorInfo[2]),
    //     200
    //   );
    // }

    // if(isset($data['address'])){
    //   $addressRules = array(
    //     'street' => 'required_with:city,state,country,type,zipcode',
    //     'city' => 'required_with:street,state,country,type,zipcode',
    //     'state' => 'required_with:street,city,country,type,zipcode',
    //     'country' => 'required_with:street,city,state,type,zipcode',
    //     'zipcode' => 'required_with:street,city,state,type',
    //     'type' => 'required_with:street,city,state,country'
    //   );

    //   foreach($data['address'] as $item){
    //     $addressData = (array)json_decode($item);
    //     $this->validate($addressData, $addressRules);

    //     if(isset($addressData['id'])){
    //       $address = Address::find($addressData['id']);  //when editing address
    //     } else {
    //       $address = new Address;  //when adding new address while updating the account
    //     }
        
    //     $address->street = $addressData['street'];
    //     $address->city = $addressData['city'];
    //     $address->state = $addressData['state'];
    //     $address->country = $addressData['country'];
    //     $address->type = $addressData['type'];
    //     $address->zipcode = $addressData['zipcode'];
    //     $address->account = $account->id;

    //     try{
    //         $address->save();
    //       } catch(Exception $e){
    //         return Response::json(array(
    //           'error' => true,
    //           'message' => $e->errorInfo[2]),
    //           200
    //         );
    //       }
    //   }
      
    // }

    // return Response::json(array(
    //     'error' => false,
    //     'message' => 'Account successfully updated.'),
    //     200
    // );
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
