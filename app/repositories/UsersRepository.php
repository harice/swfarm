<?php
 
class UsersRepository implements UsersRepositoryInterface {

  /**
   * Validation Rules
   * this is just a place for us to store these, you could
   * alternatively place them in your repository
   * @var array
   */
  /*public static $rules = array(
    'username' => 'required|unique:users',
    'password' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15|confirmed',
    'password_confirmation' => 'required|regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/|between:8,15',
    'email' => 'required|email|unique:users',
    'firstname' => 'required|between:2,50',
    'lastname' => 'required|between:2,50',
    'emp_no' => 'required|unique:users',
    'suffix' => 'between:2,6',
    'phone' => 'between:6,13',
    'mobile' => 'between:9,13',
    'position' => 'between:2,50'
  );*/

  public function findById($id){
  	$user = User::find($id);

    if($user){
      $response = Response::json(
        $user->toArray(),
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


  public function paginate($perPage, $offset){
    $count = User::where('id', '!=', 1)->count();
    $usersList = User::where('id', '!=', 1)->take($perPage)->offset($offset)->get();
    
    return Response::json(array(
      'data'=>$usersList->toArray(),
      'total'=>$count
    ));

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

  public function instance(){}

}