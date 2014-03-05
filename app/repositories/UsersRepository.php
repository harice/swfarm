<?php
 
class UsersRepository implements UsersRepositoryInterface {

  public function findById($id){
  	$user = User::find($id);
    
    if($user){
      $user['roles'] = null;
      $userRoles = $user->userRoles()->with('roles')->get();

      if($userRoles->count() > 0){
        $roles = array();
        $userRoles = $userRoles->toArray();
        foreach($userRoles as $role){
          array_push($roles, $role['roles'][0]);
        }
        $user['roles'] = $roles;
      }
      
      $response = Response::json(
        $user,
        200
      );
    } else {
      $response = Response::json(array(
        'error' => true,
        'message' => "User not found"),
        200
      );
    }

    return $response;
    
  }

  public function findAll(){
  	return User::where('id', '!=', 1)->get(); //exclude the super admin
  }


  public function paginate($perPage, $offset, $sortby, $orderby){
    $errorMsg = null;
    $sortby = strtolower($sortby);
    $orderby = strtolower($orderby);
    //check if input pass are valid
    if(!($sortby == 'firstname' || $sortby == 'lastname' || $sortby == 'email')){
      $errorMsg = 'Sort by category not found.';
    } else if(!($orderby == 'asc' || $orderby == 'desc')){
      $errorMsg = 'Order by category not found(ASC or DESC expected).';
    } else {
      //pulling of data
      $count = User::where('id', '!=', 1)->count();
      $usersList = User::where('id', '!=', 1)->take($perPage)->offset($offset)->orderBy($sortby, $orderby)->get();

      $response = Response::json(array(
        'data'=>$usersList->toArray(),
        'total'=>$count
      ));
    }

    if($errorMsg){
      $response = Response::json(array(
        'error' => true,
        'message' => $errorMsg),
        200
      );
    }

    return $response;
    
  }

  public function store($data){

    $rules = array(
      'username' => 'required|unique:users',
      //'password' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15|confirmed',
      //'password_confirmation' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15',
      'email' => 'required|email|unique:users',
      'firstname' => 'required|between:2,50',
      'lastname' => 'required|between:2,50',
      'emp_no' => 'required|unique:users',
      'suffix' => 'between:2,6',
      'phone' => 'between:6,13',
      'mobile' => 'between:9,13',
      'position' => 'between:2,50'
    );


  	$this->validate($data, $rules);
   
  	$user = new User;
  	$user->username = $data['username'];
  	$user->password = Str::random(10); //replace with this if the system has already email to user features - Hash::make(Str::random(10));
  	$user->email = $data['email'];
  	$user->firstname = $data['firstname'];
  	$user->lastname = $data['lastname'];
  	$user->suffix = $data['suffix'];
  	$user->emp_no = $data['emp_no'];
  	$user->mobile = $data['mobile'];
  	$user->phone = $data['phone'];
  	$user->position = $data['position'];

    $user->save();

    //saving user roles posted by client
    if(isset($data['roles'])){
      $rolesId = explode(',', $data['roles']);
      foreach($rolesId as $role){   
          $userRole = new UserRoles;
          $userRole->user = $user->id;
          $userRole->role = $role;

          $userRole->save();
      }

    }

  	return Response::json(array(
  	    'error' => false,
  	    'user' => $user->toArray()),
  	    200
  	);
  }

  public function update($id, $data){
    $rules = array(
      'username' => 'required|unique:users,username,'.$id,
      //'password' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15|confirmed',
      //'password_confirmation' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15',
      'email' => 'required|email|unique:users,email,'.$id,
      'firstname' => 'required|between:2,50',
      'lastname' => 'required|between:2,50',
      'emp_no' => 'required|unique:users,emp_no,'.$id,
      'suffix' => 'between:2,6',
      'phone' => 'between:6,13',
      'mobile' => 'between:9,13',
      'position' => 'between:2,50'
    );


    $user = User::find($id); //get the user row

    if($user) {
      $this->validate($data, $rules);

      $user->username = $data['username'];
      //$user->password = $data['password'];
      $user->email = $data['email'];
      $user->firstname = $data['firstname'];
      $user->lastname = $data['lastname'];
      $user->suffix = $data['suffix'];
      $user->emp_no = $data['emp_no'];
      $user->mobile = $data['mobile'];
      $user->phone = $data['phone'];
      $user->position = $data['position'];

      $user->save();

      //saving user roles posted by client
      if(isset($data['roles'])){
        //client must pass value in comma separated format
        $rolesIds = explode(',', $data['roles']); 
        //deleting role that is uncheck in client side
        if($data['roles'] == '' || $data['roles'] == null){
          UserRoles::where('user', '=', $id)->delete(); //deleting all roles if client send empty role value
        } else {
          UserRoles::where('user', '=', $id)->whereNotIn('role', $rolesIds)->delete(); 

          foreach($rolesIds as $role){
              if(UserRoles::where('user', '=', $id)->where('role', '=', $role)->count() > 0){
                continue; //skip if role already exist
              }   
              $userRole = new UserRoles;
              $userRole->user = $user->id;
              $userRole->role = $role;

              $userRole->save();
          }
        }
      }

      $response = Response::json(array(
          'error' => false,
          'user' => $user->toArray()),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => "User not found"),
          200
      );
    }

    return $response;
    

  }

  public function destroy($id){
    $user = User::find($id);

    if($user){
      $user->delete();

      $response = Response::json(array(
          'error' => false,
          'user' => $user->toArray()),
          200
      );
    } else {
      $response = Response::json(array(
          'error' => true,
          'message' => "User not found"),
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

  public function instance($data = array()){
    return new User($data);
  }

}