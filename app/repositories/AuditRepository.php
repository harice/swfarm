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
  
  public function paginate($input) {
      
      // $removefields = array('confirmcode', 'validated', 'status', 'deleted', 'deleted_at');
    
    $perPage = array_key_exists('perpage', $input) ? $input['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
    $page = array_key_exists('page', $input) ? $input['page'] : 1;
    $sortby = array_key_exists('sortby', $input) ? $input['sortby'] : 'created_at';
    $orderby = array_key_exists('orderby', $input) ? $input['orderby'] : 'desc';
    $type = array_key_exists('type', $input) ? $input['type'] : '';
    $data_id = array_key_exists('data_id', $input) ? $input['data_id'] : '';
    $offset = $page*$perPage-$perPage;
    
    $errorMsg = null;
    $sortby = strtolower($sortby);
    $orderby = strtolower($orderby);
    $type = str_replace('"',"",$type);
    $data_id = str_replace('"',"",$data_id);
    
    if(!($sortby == 'created_at')){
      $errorMsg = 'Sort by category not found.';
    } else if(!($orderby == 'asc' || $orderby == 'desc')){
      $errorMsg = 'Order by category not found(ASC or DESC expected).';
    } else {
      
      // Generate Query depending on given parameters.
      // TO DO: Needs to be refactored
      if(!empty($type)){
        if(!empty($data_id)) {
          $count = Audit::where('type', $type)
              ->where('data_id', $data_id)
              ->count();
          $auditList = Audit::where('type', $type)
              ->where('data_id', $data_id)
              ->take($perPage)
              ->offset($offset)
              ->orderBy($sortby, $orderby)
              ->get();
        } else {
          $count = Audit::where('type', $type)
              ->count();
          $auditList = Audit::where('type', $type)
              ->take($perPage)
              ->offset($offset)
              ->orderBy($sortby, $orderby)
              ->get();
        }
      } else {
        $count = Audit::count();
        $auditList = Audit::take($perPage)
            ->offset($offset)
            ->orderBy($sortby, $orderby)
            ->get();
      }
      $auditList = $auditList->toArray();
      
      // Convert JSON value to Array
      for ($i=0; $i<count($auditList); $i++) {
        $oldValue = unserialize($auditList[$i]["value"])->toArray();
        
        // Remove unnecessary fields
        unset($oldValue['confirmcode']);
        
        $auditList[$i]["value"] = $oldValue;
      }

      $response = Response::json(array(
        'data'=>$auditList,
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