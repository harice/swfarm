<?php

class Roles extends Eloquent {
	
  use Culpa\CreatedBy;
  use Culpa\DeletedBy;
  use Culpa\UpdatedBy;
  
  protected $blameable = array('created', 'updated', 'deleted');
  
  protected $guarded = array();

	public static $rules = array('name' => 'required');

	public function permission(){
		return $this->belongsTo('Permission');
	}

	public function userRoles(){
		return $this->belongsTo('UserRoles', 'role', 'id');
	}
}

Roles::observe(new Culpa\BlameableObserver);