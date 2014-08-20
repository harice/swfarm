<?php
 
class AccountRepository implements AccountRepositoryInterface {

  public function findAll() { return Response::json(Account::all()->toArray(),200); }

  public function findById($id)
  {
    $account = Account::with('accounttype', 'address', 'address.addressStates', 'address.addressType')->find($id);          

    if($account)
      $response = Response::json($account->toArray(),200);
    else
      $response = Response::json(array('error' => array('message' => "Account not found")),500);

    return $response;
  }

  public function paginate($params)
  {
    $params = array_filter($params);

    $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
    $page = isset($params['page']) ? $params['page'] : 1;
    $sortby = isset($params['sortby']) ? $params['sortby'] : 'name';
    $orderby = isset($params['orderby']) ? $params['orderby'] : 'ASC';
    $offset = $page * $perPage - $perPage;

    $accounts = Account::with('accounttype')->orderBy($sortby,$orderby)->offset($offset);
    
    if(isset($params['filter'])) {
      $filter = $params['filter'];
      $accounts->whereHas('accounttype', function($q) use($filter) { $q->where('accounttype_id','=', $filter); } );
    }

    if(isset($params['search'])) {
      $search = $params['search'];
      $accounts->where(function($q) use($search) { 
        $q->orWhere('name','like','%'.$search.'%')
          ->orWhere('website','like','%'.$search.'%')
          ->orWhere('description','like','%'.$search.'%');
      });
    }

    $result = $accounts->paginate($perPage)->toArray();

    return Response::json( array( 'data' => $result['data'], 'total' => $result['total'] ) );
  }

  private function validateExtras() 
  {
    Validator::extend('contains',function($attribute, $value, $parameters){ 
      if(!is_array($value)) $value = explode(',',$value);
      return sizeof(array_filter($value)) > intval($parameters[0]) - 1 ? true : false;
    });
    Validator::replacer('contains', function($message, $attribute, $rule, $parameters){ return str_replace(':contains', $parameters[0], $message); });
  }

  public function store($data) 
  {
    $this->validateExtras();

    $rules = array(
      'name' => 'required|unique:account',
      'phone' => 'required|between:14,14',
      'accounttype' => 'required|contains:1',
      'address' => 'required|array|contains:1'
    );

    $this->validate($data, $rules);

    DB::transaction(function() use ($data){

      $account = new Account;
      $account->name = $data['name'];
      $account->website = isset($data['website']) ? $data['website'] : '';
      $account->description = isset($data['description']) ? $data['description'] : '';
      $account->phone = isset($data['phone']) ? $data['phone'] : '';
      $account->save();

      if(!is_array($data['accounttype'])) $data['accounttype'] = explode(',',$data['accounttype']);
      $account->accountType()->sync(array_filter($data['accounttype']));

      $addressRules = array(
        'street' => 'required_with:city,state,country,type,zipcode',
        'city' => 'required_with:street,state,country,type,zipcode',
        'state' => 'required_with:street,city,country,type,zipcode',
        'country' => 'required_with:street,city,state,type,zipcode',
        'zipcode' => 'required_with:street,city,state,type',
        'type' => 'required_with:street,city,state,country'
      );

      foreach($data['address'] as $addressData){
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
      
    });

    return Response::json(array( 'error' => false, 'message' => Lang::get('messages.success.created', array('entity' => 'Account'))), 200);
  }

  public function update($id, $data)
  {
    $this->validateExtras();

    $rules = array(
      'name' => 'required|unique:account,name,'.$id,
      'phone' => 'required|between:14,14',
      'accounttype' => 'required|contains:1',
      'address' => 'required|array|contains:1'
    );

    $this->validate($data, $rules);

    DB::transaction(function() use ($id, $data){

      $account = Account::find($id);
      $account->name = $data['name'];
      $account->website = isset($data['website']) ? $data['website'] : '';
      $account->description = isset($data['description']) ? $data['description'] : '';
      $account->phone = isset($data['phone']) ? $data['phone'] : '';
      $account->save();

      if(!is_array($data['accounttype'])) $data['accounttype'] = explode(',',$data['accounttype']);
      $account->accountType()->sync(array_filter($data['accounttype']));

      $addressesList = array();
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
        if(isset($addressData['id'])) $existingAddressId[] = $addressData['id'];
      }
      
      $this->deleteAddresses($account->id, $existingAddressId); //delete addresses that is not pass excluding the new addresses

      foreach($data['address'] as $addressData) {
        $this->validate($addressData, $addressRules);
        
        if(isset($addressData['id'])) $address = Address::find($addressData['id']);
        else $address = new Address;
        
        $address->street = $addressData['street'];
        $address->city = $addressData['city'];
        $address->state = $addressData['state'];
        $address->country = $addressData['country'];
        $address->type = $addressData['type'];
        $address->zipcode = $addressData['zipcode'];
        $address->account = $account->id;

        $address->save();
      }

    });

    return Response::json( array( 'error' => false, 'message' => Lang::get('messages.success.updated', array('entity' => 'Account'))), 200 );
  }

  private function deleteAddresses($account, $addressIdList = null)
  {
    if(is_null($addressIdList)) {
      $address = Address::with('account')->whereHas('account', function($query) use ($account) { $query->where('id', '=', $account); })->delete();
    } else {
      $address = Address::with('account')->whereHas('account', function($query) use ($account) { $query->where('id', '=', $account); })
                    ->whereNotIn('id',$addressIdList)
                    ->delete();
    }
    return $address;
  }

  public function destroy($id)
  {
    $account = Account::find($id);

    if($account){
      $account->delete();

      $response = Response::json(array(
          'error' => false,
          'message' => Lang::get('messages.success.deleted', array('entity' => 'Account')),
          'account' => $account->toArray()),
          200
      );
    } else $response = Response::json(array('error' => array('message' => Lang::get('messages.notfound', array('entity' => 'Account')))),500);

    return $response;
  }
  
  public function validate($data, $rules)
  {
    $validator = Validator::make($data, $rules);

    if($validator->fails()) { 
      throw new ValidationException($validator); 
    }
  }


  public function instance($data = array())
  {
    return new Account($data);
  }

  public function getFormData()
  {
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

  public function getAccountsByName($name)
  {
    if(isset($name))
      $account = Account::with('accounttype')->where('name','like','%'.$name.'%')->orderBy('name', 'asc')->get();
    else
      $account = Account::orderBy('name', 'asc')->all()->get(array('id','name'));

    return Response::json($account);
  }

  private function filterByNameAndType($search,$type=1)
  {
    $accounts = Account::with('address')
                  ->with('address.addressStates')
                  ->whereHas('accounttype', function($q) use($type) { $q->where('accounttype_id','=', $type); } )
                  ->where('name','like', '%'.$search.'%')
                  ->orderBy('name', 'asc')
                  ->get();

    return Response::json($accounts->toArray(),200);
  }
  
  public function getCustomerAccount($search)
  {
    return $this->filterByNameAndType($search);
  }

  public function getProducerAccount($search)
  {
    return $this->filterByNameAndType($search,5);
  }

  public function getAddress($accountId)
  {
    $addresses = Address::with('addressType')->with('addressStates')->where('account', '=', $accountId)->get();
    return Response::json( $addresses->toArray(), 200 );
  }

  public function getAccountsByType($types)
  {
    $accounts = Account::with('accounttype')
                  ->whereHas('accounttype', function($q) use($types) { $q->where('accounttype_id', '=', $types); } )
                  ->get(array('id', 'name'));

    return Response::json( $accounts->toArray(), 200 );
  }

  public function getTrailerAccount()
  {
    $types = array(7); //operator, hauler, Southwest Farms trucker [accounttype ids]
    $accounts = Account::with('accounttype','trailer')
                  ->whereHas('accounttype', function($q) use($types) { $q->whereIn('accounttype_id', $types); } )
                  ->groupBy('id')
                  ->get(array('id', 'name'));

    return Response::json( $accounts->toArray(), 200 );
  }

  public function getScalerAccount(){
    $types = array(6); //scale [accounttype ids]
    $accounts = Account::with('accounttype','scaler')
                ->whereHas('accounttype', function($q) use($types) { $q->whereIn('accounttype_id', $types); } )
                ->groupBy('id')
                ->get(array('id', 'name'));

    return Response::json( $accounts->toArray(), 200 );
  }

  public function getProducerAndWarehouseAccount(){
    $types = array(5, 10); //scale [accounttype ids]
    $accounts = Account::with('accounttype')
                ->whereHas('accounttype', function($q) use($types) { $q->whereIn('accounttype_id', $types); } )
                ->groupBy('id')
                ->orderBy('name', 'asc')
                ->get(array('id', 'name'));

    return Response::json( $accounts->toArray(), 200 );
  }

  public function getLoaderAccount()
  {
    $types = array(3); //scale [accounttype ids]
    $accounts = Account::with('accounttype')
                ->whereHas('accounttype', function($q) use($types) { $q->whereIn('accounttype_id', $types); } )
                ->groupBy('id')
                ->get(array('id', 'name'));

    return Response::json( $accounts->toArray(), 200 );
  }

  public function getTruckerAccountTypes()
  {
    $accountTypeIds = array(2, 4, 9); //operator, hauler and Southwest Farms trucker accounts ids
    $truckerTypes = AccountType::whereIn('id', $accountTypeIds)->get(array('id', 'name'));
    return Response::json( $truckerTypes->toArray(), 200 );
  }

  public function getAllContactOnAccount($accountId)
  {
    $contacts = Contact::whereHas('Account', function($query) use ($accountId){ $query->where('id', '=', $accountId); })->get(array('id','firstname','lastname','suffix'));
    return Response::json( $contacts->toArray(), 200 );
  }

  public function getScaleList($scalerAccount_id)
  {
      $scaleList = Scale::where('account_id', '=', $scalerAccount_id)->get();
      return Response::json(
          $scaleList->toArray(),
          200
      );
  }

  public function getContracts($account_id)
  {
    $contracts = Contract::where('account_id', '=', $account_id)->get(array('id', 'contract_number'));
    return Response::json( $contracts->toArray(), 200);
  }

}
