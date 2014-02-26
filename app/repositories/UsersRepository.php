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
    'password' => 'required',
    'email' => 'required|email|unique:users',
    'firstname' => 'required',
    'lastname' => 'required'
  );

  public function findById($id){
  	
  }

  public function findAll(){
  	return User::all();
  }

  public function paginate($limit = null){}

  public function store($data){
	$this->validate($data);

	$user = new User;
	$user->username = Request::get('username');
	$user->password = Request::get('password');
	$user->email = Request::get('email');
	$user->firstname = Request::get('firstname');
	$user->lastname = Request::get('lastname');
	$user->suffix = Request::get('suffix');
	$user->emp_no = Request::get('emp_no');
	$user->mobile = Request::get('mobile');
	$user->phone = Request::get('phone');
	$user->position = Request::get('position');

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
    //return true;
  }

  public function instance(){}

}