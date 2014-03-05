<?php
 
class PermissionRepository implements PermissionRepositoryInterface {

  public function findAll(){
    echo "find All here";
  }

  public function findById($id){
    
  }

  public function paginate($perPage, $offset){
  
  }

  public function store($data){
   
  }

  public function update($id, $data){
   
  }

  public function destroy($id){
    
  }
  
  public function validate($data, $rules){
    $validator = Validator::make($data, $rules);

    if($validator->fails()) { 
      throw new ValidationException($validator); 
    }
  }


  public function instance($data = array())
  {
    return new Permission($data);
  }
}