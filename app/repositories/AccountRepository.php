<?php
 
class AccountRepository implements AccountRepositoryInterface {

  public function findAll(){
    $account = Account::all();

    return Response::json(
        $account->toArray(),
        200
      );
  }

  public function findById($id){
    $account = Account::with('accounttype')->with('address', 'address.addressStates', 'address.addressType')->find($id);          

    if($account){
      $response = Response::json(
        $account->toArray(),
        200
      );
    } else {
      $response = Response::json(array(
        'error' => true,
        'message' => "Account not found"),
        200
      );
    }

    return $response;
  }

  public function paginate($params){
    $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST'); //default to 10 items, see app/config/constants
    $page = isset($params['page']) ? $params['page'] : '1'; //default to page 1
    $sortby = isset($params['sortby']) ? $params['sortby'] : 'name'; //default sort to account name
    $orderby = isset($params['orderby']) ? $params['orderby'] : 'ASC'; //default order is Ascending
    $offset = $page*$perPage-$perPage;

    //pulling of data
    if(!isset($params['filter']) || $params['filter'] == ''){
      $count = Account::count();
      $accountList = Account::with('accounttype')
                    ->take($perPage)->offset($offset)
                    ->orderBy($sortby, $orderby)
                    ->get();
    } else {
      $filter = $params['filter']; // accounttype id
      $count = Account::where(function ($query) use ($filter){
                        $query->where('accounttype', '=', $filter);
                      })->count();
      $accountList = Account::with('accounttype')
                      ->where(function ($query) use ($filter){
                        $query->where('accounttype', '=', $filter);
                      })
                      ->take($perPage)
                      ->offset($offset)
                      ->orderBy($sortby, $orderby)
                      ->get();
    }

    return Response::json(array(
      'data'=>$accountList->toArray(),
      'total'=>$count
    ));

  }

  public function store($data){
    $rules = array(
      'name' => 'required|unique:account',
      'accounttype' => 'required',
      'phone' => 'between:1,12'
    );

    $this->validate($data, $rules);

    DB::transaction(function() use ($data){

      $account = new Account;
      $account->name = $data['name'];
      $account->website = isset($data['website']) ? $data['website'] : '';
      $account->description = isset($data['description']) ? $data['description'] : '';
      $account->phone = isset($data['phone']) ? $data['phone'] : '';
      $account->accounttype = $data['accounttype'];

      $account->save();

      if(isset($data['address'])){
        $addressRules = array(
          'street' => 'required_with:city,state,country,type,zipcode',
          'city' => 'required_with:street,state,country,type,zipcode',
          'state' => 'required_with:street,city,country,type,zipcode',
          'country' => 'required_with:street,city,state,type,zipcode',
          'zipcode' => 'required_with:street,city,state,type',
          'type' => 'required_with:street,city,state,country'
        );

        foreach($data['address'] as $addressData){
          //$addressData = (array)json_decode($item);

          $this->validate($addressData, $addressRules);

          $address = new Address;
          $address->street = $addressData['street'];
          $address->city = $addressData['city'];
          $address->state = $addressData['state'];
          $address->country = $addressData['country'];
          $address->type = $addressData['type'];
          $address->zipcode = $addressData['zipcode'];
          $address->account = $account->id;

          $address->save();

        }
      }

    });

    return Response::json(array(
        'error' => false,
        'message' => Lang::get('messages.success.created', array('entity' => 'Account'))),
        200
    );
  }

  public function update($id, $data){
    $rules = array(
      'name' => 'required|unique:account,name,'.$id,
      'accounttype' => 'required',
      'phone' => 'between:1,12',
    );

    $this->validate($data, $rules);

    DB::transaction(function() use ($id, $data){
      $account = Account::find($id);
      $account->name = $data['name'];
      $account->website = isset($data['website']) ? $data['website'] : '';
      $account->description = isset($data['description']) ? $data['description'] : '';
      $account->phone = isset($data['phone']) ? $data['phone'] : '';
      $account->accounttype = $data['accounttype'];

      $account->save();

      $addressesList = array();
      

      if(isset($data['address'])){
        $addressRules = array(
          'street' => 'required_with:city,state,country,type,zipcode',
          'city' => 'required_with:street,state,country,type,zipcode',
          'state' => 'required_with:street,city,country,type,zipcode',
          'country' => 'required_with:street,city,state,type,zipcode',
          'zipcode' => 'required_with:street,city,state,type',
          'type' => 'required_with:street,city,state,country'
        );

        //deleting addresses
        $existingAddressId = array();

        foreach($data['address'] as $addressData){
          //$addressData = (array)json_decode($item);
          if(isset($addressData['id'])){
            $existingAddressId[] = $addressData['id'];
          }
        }
        
        $this->deleteAddresses($account->id, $existingAddressId); //delete addresses that is not pass excluding the new addresses

        foreach($data['address'] as $addressData){
          //$addressData = (array)json_decode($item);
          $this->validate($addressData, $addressRules);
          
          if(isset($addressData['id'])){
            $address = Address::find($addressData['id']);
          } else {
            $address = new Address;
          }
          
          $address->street = $addressData['street'];
          $address->city = $addressData['city'];
          $address->state = $addressData['state'];
          $address->country = $addressData['country'];
          $address->type = $addressData['type'];
          $address->zipcode = $addressData['zipcode'];
          $address->account = $account->id;

          $address->save();
        } 
      } else{
        $this->deleteAddresses($account->id); //no address data pass, so delete all addresses
      }

    });

    return Response::json(array(
        'error' => false,
        'message' => Lang::get('messages.success.updated', array('entity' => 'Account'))),
        200
    );
  }

  private function deleteAddresses($account, $addressIdList = null){
    if($addressIdList == null){
      $address = Address::with('account')
                ->whereHas('account', function($query) use ($account)
                {
                    $query->where('id', '=', $account);

                })
                ->delete();
    } else {
      $address = Address::with('account')
                ->whereHas('account', function($query) use ($account)
                {
                    $query->where('id', '=', $account);

                })
                ->whereNotIn('id',$addressIdList)
                ->delete();
    }
    return $address;
  }

  public function search($_search)
  {
    $perPage  = isset($_search['perpage']) ? $_search['perpage'] : Config::get('constants.USERS_PER_LIST');
    $page     = isset($_search['page']) ? $_search['page'] : 1;
    $sortby   = isset($_search['sortby']) ? $_search['sortby'] : 'name';
    $orderby  = isset($_search['orderby']) ? $_search['orderby'] :'ASC';
    $offset   = $page * $perPage - $perPage;

    
      $searchWord = $_search['search'];
      

      $_cnt = Account::with('accounttype')->where(function ($query) use ($searchWord){
                        $query->orWhere('name','like','%'.$searchWord.'%')
                              ->orWhere('website','like','%'.$searchWord.'%')
                              ->orWhere('description','like','%'.$searchWord.'%');
                      });

      $_account = Account::with('accounttype')->where(function ($query) use ($searchWord){
                        $query->orWhere('name','like','%'.$searchWord.'%')
                              ->orWhere('website','like','%'.$searchWord.'%')
                              ->orWhere('description','like','%'.$searchWord.'%');
                      });

      if(isset($_search['filter']) && $_search['filter'] != ''){
        $searchFilter = $_search['filter']; //for filter
        $_cnt = $_cnt->where(function ($query) use ($searchFilter){
                          $query->where('accounttype', '=', $searchFilter);
                        });
        $_account = $_account->where(function ($query) use ($searchFilter){
                          $query->where('accounttype', '=', $searchFilter);
                        });
      }

      $_cnt = $_cnt->count();
      $_account = $_account->take($perPage)
                      ->offset($offset)
                      ->orderBy($sortby, $orderby)
                      ->get();
    
    return Response::json(array(
      'data' => $_account->toArray(), 
      'total' => $_cnt),
      200);
  }

  public function destroy($id){
    $account = Account::find($id);

    if($account){
      $account->delete();

      $response = Response::json(array(
          'error' => false,
          'message' => Lang::get('messages.success.deleted', array('entity' => 'Account')),
          'account' => $account->toArray()),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => Lang::get('messages.notfound', array('entity' => 'Account'))),
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
    return new Account($data);
  }

  public function getFormData(){
      $accountTypes = AccountType::orderby('name', 'asc')->get();
      $addressTypes = AddressType::orderby('name', 'asc')->get();
      $states = AddressStates::orderby('state', 'asc')->get();

      return Response::json(
          array(
          'accountTypes' => $accountTypes->toArray(),
          'addressTypes' => $addressTypes->toArray(),
          'states' => $states->toArray()
          ),
          200
      );
  }

  // public function getCitiesByState($stateId){
  //   $cities = AddressCity::where('state', '=', $stateId)->get();
    
  //     return Response::json(
  //         $cities->toArray(),
  //         200
  //     );
  // }

  public function getAccountsByName($name){
    if(isset($name)){
      $account = Account::with('accounttype')
                  ->where('name','like','%'.$name.'%')
                  ->orderBy('name', 'asc')
                  ->get();
    } else {
      $account = Account::orderBy('name', 'asc')->all()->get(array('id','name'));
    }
    return Response::json($account);
  }

  // public function getZipcodeUsingCity($city){
  //   $zips = AddressZip::where('city','=', $city)
  //                 ->orderBy('zip', 'asc')
  //                 ->get(array('zip'));
  //   return Response::json(
  //         $zips->toArray(),
  //         200
  //     );
  // }
  
  public function getCustomerAccount($search){
    $producers = Account::with('address')
                  ->with('address.addressStates')
				          ->where('accounttype', '=', 1)
                  ->where('name','like', '%'.$search.'%')
                  ->orderBy('name', 'asc')
                  ->get();

    return Response::json(
          $producers->toArray(),
          200
      );
  }

  public function getProducerAccount($search){
    $producers = Account::with('address')
                  ->with('address.addressStates')
                  ->where('accounttype', '=', 5)
                  ->where('name','like', '%'.$search.'%')
                  ->orderBy('name', 'asc')
                  ->get();

    return Response::json(
          $producers->toArray(),
          200
      );
  }

  public function getAddress($accountId){
    $addresses = Address::with('addressType')
                  ->with('addressStates')
                  ->where('account', '=', $accountId)
                  ->get();

    return Response::json(
          $addresses->toArray(),
          200
      );
  }


  // public function getTruckerAccount($search){
  //   if($search == ''){
  //     return Response::json(array(
  //         'error' => true,
  //         'message' => "Search word is required"),
  //         200
  //     );
  //   } else{
  //     $accountIds = array(2, 4, 9); //operator, hauler and Southwest Farms trucker accounts ids
  //     $truckers = Account::with('accounttype')->whereHas('accounttype', function ($query) use ($search, $accountIds){
  //                   $query->whereIn('id', $accountIds);
  //                 })->where('name', 'like', '%'.$search.'%')->get(array('id', 'name', 'accounttype'));
      
  //     return Response::json(
  //       $truckers->toArray(),
  //       200);
  //     }
  // }

  // public function getTruckerAccount(){
  //     $accountIds = array(2, 4, 9); //operator, hauler and Southwest Farms trucker accounts ids
  //     $truckers = Account::with('accounttype')->whereHas('accounttype', function ($query) use ($accountIds){
  //                   $query->whereIn('id', $accountIds);
  //                 })->get(array('id', 'name', 'accounttype'));

  //   return Response::json(
  //         $truckers->toArray(),
  //         200
  //     );
  // }

  public function getAccountsByType($accountTypeId){
      $accounts = Account::with('accounttype')
                  ->whereHas('accounttype', function ($query) use ($accountTypeId){
                      $query->where('id', '=', $accountTypeId);
                  })->get(array('id', 'name','accounttype'));

      return Response::json(
            $accounts->toArray(),
            200
        );
  }

  public function getTrailerAccount(){
      $accountIds = array(7); //operator, hauler and Southwest Farms trucker accounts ids
      $truckers = Account::with('accounttype')->with('trailer')->whereHas('accounttype', function ($query) use ($accountIds){
                    $query->whereIn('id', $accountIds);
                  })->get(array('id', 'name', 'accounttype'));

    return Response::json(
          $truckers->toArray(),
          200
      );
  }

  public function getLoaderAccount(){
      $accountIds = array(3); //loader id
      $truckers = Account::with('accounttype')->whereHas('accounttype', function ($query) use ($accountIds){
                    $query->whereIn('id', $accountIds);
                  })->get(array('id', 'name', 'accounttype'));

    return Response::json(
          $truckers->toArray(),
          200
      );
  }

  public function getTruckerAccountTypes(){
      $accountTypeIds = array(2, 4, 9); //operator, hauler and Southwest Farms trucker accounts ids
      // $truckerTypes = Account::with('accounttype')->whereHas('accounttype', function ($query) use ($accountIds){
      //               $query->whereIn('id', $accountIds);
      //             })->get(array('id', 'name', 'accounttype'));
      $truckerTypes = AccountType::whereIn('id', $accountTypeIds)->get(array('id', 'name'));

    return Response::json(
          $truckerTypes->toArray(),
          200
      );
  }

  // public function getLoaderAccount($search){
  //   if($search == '') {
  //     return Response::json(array(
  //         'error' => true,
  //         'message' => "Search word is required"),
  //         200
  //     );
  //   } else {
  //     $accountIds = array(3); //loader id
  //     $loader = Account::whereHas('accounttype', function ($query) use ($search, $accountIds){
  //                   $query->whereIn('id', $accountIds);
  //                 })->where('name', 'like', '%'.$search.'%')->get(array('id', 'name'));
      
  //     return Response::json(
  //       $loader->toArray(),
  //       200);
  //     }
  // }

  public function getAllContactOnAccount($accountId){
    $truckerList = Contact::whereHas('Account', function($query) use ($accountId){
                    $query->where('id', '=', $accountId);
                  })->get(array('id','firstname','lastname'));
    
    return Response::json(
        $truckerList->toArray(),
        200);
  }

}
