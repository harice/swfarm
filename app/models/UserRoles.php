<?php

class UserRoles extends Eloquent {
    protected $fillable = [];

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'userroles';

    public function roles(){
    	return $this->hasMany('Roles', 'id', 'role');
    }

    public function users(){
    	return $this->hasMany('Users');
    }
}