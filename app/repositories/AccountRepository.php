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
    $account = Account::with('accountType')->with('address', 'address.addressStates', 'address.addressCity', 'address.addressType')->find($id);          

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
      'website' => 'url',
      'accounttype' => 'required',
    );


    $this->validate($data, $rules);

    $account = new Account;
    $account->name = $data['name'];
    $account->website = isset($data['website']) ? $data['website'] : '';
    $account->description = isset($data['description']) ? $data['description'] : '';
    $account->phone = isset($data['phone']) ? $data['phone'] : '';
    $account->accounttype = $data['accounttype'];

    try{
      $account->save();
    } catch(Exception $e){
      return Response::json(array(
        'error' => true,
        'message' => $e->errorInfo[2]),
        200
      );
    }

    if(isset($data['address'])){
      $addressRules = array(
        'street' => 'required_with:city,state,country,type,zipcode',
        'city' => 'required_with:street,state,country,type,zipcode',
        'state' => 'required_with:street,city,country,type,zipcode',
        'country' => 'required_with:street,city,state,type,zipcode',
        'zipcode' => 'required_with:street,city,state,type',
        'type' => 'required_with:street,city,state,country'
      );

      foreach($data['address'] as $item){
        $addressData = (array)json_decode($item);
        $this->validate($addressData, $addressRules);

        $address = new Address;
        $address->street = $addressData['street'];
        $address->city = $addressData['city'];
        $address->state = $addressData['state'];
        $address->country = $addressData['country'];
        $address->type = $addressData['type'];
        $address->zipcode = $addressData['zipcode'];
        $address->account = $account->id;

        try{
            $address->save();
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
        'account' => $account->toArray()),
        200
    );
  }

  public function update($id, $data){
    $rules = array(
      'name' => 'required|unique:account,name,'.$id,
      'website' => 'url',
      'accounttype' => 'required',
    );


    $this->validate($data, $rules);

    $account = Account::find($id);
    $account->name = $data['name'];
    $account->website = isset($data['website']) ? $data['website'] : '';
    $account->description = isset($data['description']) ? $data['description'] : '';
    $account->phone = isset($data['phone']) ? $data['phone'] : '';
    $account->accounttype = $data['accounttype'];

    try{
      $account->save();
    } catch(Exception $e){
      return Response::json(array(
        'error' => true,
        'message' => $e->errorInfo[2]),
        200
      );
    }

    if(isset($data['address'])){
      $addressRules = array(
        'street' => 'required_with:city,state,country,type,zipcode',
        'city' => 'required_with:street,state,country,type,zipcode',
        'state' => 'required_with:street,city,country,type,zipcode',
        'country' => 'required_with:street,city,state,type,zipcode',
        'zipcode' => 'required_with:street,city,state,type',
        'type' => 'required_with:street,city,state,country'
      );

      foreach($data['address'] as $item){
        $addressData = (array)json_decode($item);
        $this->validate($addressData, $addressRules);

        if(isset($addressData['id'])){
          $address = Address::find($addressData['id']);  //when editing address
        } else {
          $address = new Address;  //when adding new address while updating the account
        }
        
        $address->street = $addressData['street'];
        $address->city = $addressData['city'];
        $address->state = $addressData['state'];
        $address->country = $addressData['country'];
        $address->type = $addressData['type'];
        $address->zipcode = $addressData['zipcode'];
        $address->account = $account->id;

        try{
            $address->save();
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
        'account' => $account->toArray()),
        200
    );
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
          'account' => $account->toArray()),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => "account not found"),
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

  public function getCitiesByState($stateId){
    $cities = AddressCity::where('state', '=', $stateId)->get();
    
      return Response::json(
          $cities->toArray(),
          200
      );
  }

  public function getAccountsByName($name){
    if(isset($name)){
      $account = Account::where('name','like','%'.$name.'%')
                  ->orderBy('name', 'asc')
                  ->get(array('id','name'));
    } else {
      $account = Account::orderBy('name', 'asc')->all()->get(array('id','name'));
    }
    return Response::json($account);
  }

}