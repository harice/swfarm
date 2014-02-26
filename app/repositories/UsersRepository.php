<?php
 
class UsersRepository implements UsersRepositoryInterface {

  /**
   * Validation Rules
   * this is just a place for us to store these, you could
   * alternatively place them in your repository
   * @var array
   */
  public static $rules = array(
    'username' => 'required|unique:users',
    'password' => 'required|regex:/^(?=.*[A-Z])(?=.*[0-9]).+$/i',
    'email' => 'required|email|unique:users',
    'firstname' => 'required',
    'lastname' => 'required',
    'emp_no' => 'unique'
  );

  public function findById($id){
  	
  }

  public function findAll(){
  	return User::all();
  }

  public function paginate($limit = null){}

  public function store($data){
  	$this->validate($data);
    //var_dump($data['username']);
    //return 1;
  	$user = new User;
  	$user->username = $data['username'];
  	$user->password = $data['password'];
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

  public function update($id, $data){}

  public function destroy($id){}

  public function validate($data){
    $validator = Validator::make($data, UsersRepository::$rules);

    if($validator->fails()) { 
    	throw new ValidationException($validator); 
    }
  }

  public function instance(){}

}