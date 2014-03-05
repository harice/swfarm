<?php

class Roles extends Eloquent {
  
  protected $guarded = array();

	public static $rules = array('name' => 'required');


	public function permission(){
		return $this->belongsTo('Permission');
	}

	public function userRoles(){
		return $this->belongsTo('UserRoles', 'role', 'id');
	}
}


