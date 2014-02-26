<?php
 
class UsersRepository implements UsersRepositoryInterface {

  /**
   * Validation Rules
   * this is just a place for us to store these, you could
   * alternatively place them in your repository
   * @var array
   */
  public static $rules = array(
    'title'    => 'required',
    'username' => 'required',
    'password' => 'required',
    'firstname' => 'required',
    'lastname' => 'required'
  );

  public function findById($id){
  	echo "find all function in User repo";
  }

  public function findAll(){}

  public function paginate($limit = null){}

  public function store($data){}

  public function update($id, $data){}

  public function destroy($id){}

  public function validate($data){}

  public function instance(){}

}