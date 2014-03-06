<?php

class Permission extends Eloquent {
    protected $fillable = [];

    protected $table = 'permission';
    public $timestamps = false;

    public function permissionCategoryType(){
    	return $this->hasMany('PermissionCategoryType');
    }

    public function roles(){
    	return $this->belongsTo('Roles');
    }
}