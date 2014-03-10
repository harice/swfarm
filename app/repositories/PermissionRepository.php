<?php
 
class PermissionRepository implements PermissionRepositoryInterface {

  public function update($id, $data){
   $role = Roles::find($id);
    if($data['permission'] != ''){
      //client must pass value in comma separated format
      $permissionIds = explode(',', $data['permission']);
      $role->permissionCategoryType()->sync($permissionIds);
    } else {
      $role->permissionCategoryType()->detach();
    }
    /*
    //deleting permissions that is uncheck in client side
    if($data['permission'] == '' || $data['permission'] == null){
      Permission::where('role', '=', $data['role'])->delete(); //deleting all permission to role if client send empty permission value
    } else {
      //deleting the permissions on db if it doesn't exist on the current given permission
      Permission::where('role', '=', $data['role'])->whereNotIn('permissioncategorytype', $permissionIds)->delete(); 

      //Adding the new permissions given
      foreach($permissionIds as $permissionId){
          if(Permission::where('role', '=', $data['role'])->where('permissioncategorytype', '=', $permissionId)->count() > 0){
            continue; //skip adding permission already exist
          }   
          $permission = new Permission;
          $permission->role = $data['role'];
          $permission->permissioncategorytype = $permissionId;

          $permission->save();
      }
    }
*/
    $response = Response::json(array(
        'error' => false,
        'message' => 'Updated user roles.'),
        200
    );

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
    return new Permission($data);
  }

  public function getAllPermissionCategoryType(){
    $permissionCategoryType = PermissionCategoryType::with('permissionType')->with('permissionCategory')->get();
    
    return Response::json(
        $permissionCategoryType->toArray(),
        200
      );
  }

  public function getPermissionByRoleId($id){
    // $rolesWithPermission = Roles::where('id', '=', $id)->with('permission')->first();
    // $rolesWithPermission = Roles::with('permission')->find($id);
    $rolesWithPermission = Roles::with('permissionCategoryType')->find($id); //refactoring

    if($rolesWithPermission->count() > 0){
      $response = Response::json(
        $rolesWithPermission->toArray(),
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

  public function getAllRoleWithPermission(){
    // $rolesWithPermission = Roles::with('permission')->get();
    $rolesWithPermission = Roles::with('permissionCategoryType')->get();

    return Response::json(
        $rolesWithPermission->toArray(),
        200
      );
  }
}