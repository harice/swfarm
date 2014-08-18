<?php

class AuditRepository implements AuditRepositoryInterface {
  
  public function paginate($input) 
  {
    $removefields = array('confirmcode', 'validated', 'status', 'deleted', 'deleted_at', 'created_at', 'updated_at', 'id');
    $perPage = isset($input['perpage']) ? $input['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
    $page = isset($input['page']) ? $input['page'] : 1;
    $sortby = isset($input['sortby']) ? $input['sortby'] : 'created_at';
    $orderby = isset($input['orderby']) ? $input['orderby'] : 'desc';
    $type = isset($input['type']) ? $input['type'] : '';
    $data_id = isset($input['data_id']) ? $input['data_id'] : '';
    $offset = $page * $perPage - $perPage;
    
    $audit = Audit::orderBy($sortby, $orderby)->offset($offset);
    if(!empty($type)){
      if(!empty($data_id))
        $audit->where('type', $type)->where('data_id', $data_id);
      else
        $audit->where('type', $type);
    }
    $result = $audit->paginate($perPage);

    $list = $result->toArray();
    if($list['total'] > 0) 
    {
      for ($i=0; $i < count($list['data']); $i++) 
      {
        $serValue = unserialize($list['data'][$i]["value"]);
        if (!is_object($serValue)) $oldValue = $serValue;
        else $oldValue = $serValue->toArray();
        
        $oldValue = array_filter($oldValue);
        
        // Remove unnecessary fields
        foreach ($removefields as $key => $value) {
          if(array_key_exists($value, $oldValue)) unset($oldValue[$value]);
        }

        $list['data'][$i]["value"] = $oldValue;
      }
    }

    $response = Response::json( array( 'data' => $list['data'], 'total' => $list['total'] ) );
    return $response;
  }
}