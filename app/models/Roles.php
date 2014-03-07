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
		return $this->belongsToMany('User', 'userroles', 'user', 'role');
	}

	public function permissionCategoryType(){
		return $this->belongsToMany('PermissionCategoryType', 'permission', 'role', 'permissioncategorytype');
	}
}

