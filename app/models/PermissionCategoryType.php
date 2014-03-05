<?php

class PermissionCategoryType extends Eloquent {
    protected $fillable = [];

    protected $table = 'permissioncategorytype';

    public function permissionType(){
    	return $this->hasMany('PermissionType');
    }

    public function permissionCategory(){
    	return $this->hasMany('PermissionCategory');
    }

    public function permission(){
    	return $this->belongsTo('Permission');
    }
}