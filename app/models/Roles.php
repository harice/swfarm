<?php

class Roles extends Eloquent {

	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'roles';

	public function permission(){
		return $this->hasMany('Permission', 'role', 'id');
	}

	public function user(){
		return $this->belongsToMany('User', 'userroles', 'user', 'role');
	}

	public function permissionCategoryType(){
		return $this->belongsToMany('PermissionCategoryType', 'permission', 'role', 'permissioncategorytype');
	}
}

