<?php

class Roles extends Eloquent {
  
  protected $guarded = array();

	public static $rules = array('name' => 'required');


	public function permission(){
		return $this->hasMany('Permission', 'role', 'id');
	}

	// public function userRoles(){
	// 	return $this->belongsTo('UserRoles', 'role', 'id');
	// }

	public function user(){
		return $this->belongsToMany('User', 'UserRoles', 'user', 'role');
	}

	public function permissionCategoryType(){
		return $this->belongsToMany('PermissionCategoryType', 'Permission', 'role', 'permissioncategorytype');
	}
}

