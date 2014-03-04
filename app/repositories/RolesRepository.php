<?php
 
class RolesRepository implements RolesRepositoryInterface {

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
      'name' => 'required|between:5,20|unique:roles'
    );

    $this->validate($data, $rules);

    $role = new Roles;
    $role->name = $data['name'];
    $role->description = $data['description'];

    $role->save();

    return Response::json(array(
        'error' => false,
        'role' => $role->toArray()),
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

  }
  
  public function validate($data, $rules){
    $validator = Validator::make($data, $rules);

    if($validator->fails()) { 
      throw new ValidationException($validator); 
    }
  }


  public function instance($data = array())
  {
    return new Roles($data);
  }
}