<?php
 
class AuditRepository implements AuditRepositoryInterface {

  public function findById($id){
    $audit = Audit::find($id);

    if($audit){
      $response = Response::json(
        $audit->toArray(),
        200
      );
    } else {
      $response = Response::json(array(
        'error' => true,
        'message' => "Audit not found"),
        200
      );
    }

    return $response;
  }

  public function paginate($perPage, $offset){
    //pulling of data
    $count = Audit::count();
    $auditList = Audit::take($perPage)->offset($offset)->orderBy('updated_at', 'ASC')->get();
    $auditList = $auditList->toArray();
    
    for ($i=0; $i<$count; $i++) {
      $oldValue = unserialize($auditList[$i]["value"])->toArray();
      $auditList[$i]["value"] = $oldValue;
    }
    
    return Response::json(array(
      'data' => $auditList,
      'total' => $count
    ));

  }

  public function store($data){
    
    $audit = new $this->instance($data);
    $audit->save();

    return Response::json(array(
        'error' => false,
        'role' => $audit->toArray()),
        200
    );
  }

  public function update($id, $data){
    $rules = array(
      'name' => 'required|unique:roles,name,'.$id,
    );


    $audit = Audit::find($id); //get the role row

    if($audit) {
      $this->validate($data, $rules);

      $audit->name = $data['name'];
      $audit->description = $data['description'];
      

      $audit->save();

      $response = Response::json(array(
          'error' => false,
          'role' => $audit->toArray()),
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
    $audit = Audit::find($id);

    if($audit){
      $audit->delete();

      $response = Response::json(array(
          'error' => false,
          'role' => $audit->toArray()),
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
    return new Audit($data);
  }
}