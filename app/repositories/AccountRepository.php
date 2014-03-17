<?php
 
class AccountRepository implements AccountRepositoryInterface {

  public function findAll(){
    $rolesList = Roles::orderby('name', 'ASC')->get();

    return Response::json(
        $rolesList->toArray(),
        200
      );
  }

  public function findById($id){
    $role = Roles::find($id);

    if($role){
      $response = Response::json(
        $role->toArray(),
        200
      );
    } else {
      $response = Response::json(array(
        'error' => true,
        'message' => "Role not found"),
        200
      );
    }

    return $response;
  }

  public function paginate($perPage, $offset){
    //pulling of data
    $count = Roles::count();
    $rolesList = Roles::take($perPage)->offset($offset)->orderBy('name', 'ASC')->get();

    return Response::json(array(
      'data'=>$rolesList->toArray(),
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
        'street' => 'required_with:city,state,country,type',
        'city' => 'required_with:street,state,country,type',
        'state' => 'required_with:street,city,country,type',
        'country' => 'required_with:street,city,state,type',
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
      'name' => 'required|unique:roles,name,'.$id,
    );


    $role = Roles::find($id); //get the role row

    if($role) {
      $this->validate($data, $rules);

      $role->name = $data['name'];
      $role->description = $data['description'];
      

      $role->save();

      $response = Response::json(array(
          'error' => false,
          'role' => $role->toArray()),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => "Role not found"),
          200
      );
    }

    return $response;
  }

  public function destroy($id){
    $role = Roles::find($id);

    if($role){
      $role->delete();

      $response = Response::json(array(
          'error' => false,
          'role' => $role->toArray()),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => "Role not found"),
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

  public function getAccountAndAddressTypes(){
      $accountTypes = AccountType::orderby('name', 'asc')->get();
      $addressTypes = AddressType::orderby('name', 'asc')->get();

      return Response::json(
          array(
          'accountTypes' => $accountTypes->toArray(),
          'addressTypes' => $addressTypes->toArray()
          ),
          200
      );
  }

}