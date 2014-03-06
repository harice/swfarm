<?php

class PermissionCategoryType extends Eloquent {
    protected $fillable = [];

    protected $table = 'permissioncategorytype';

    public function permissionType(){
    	return $this->hasMany('PermissionType', 'id', 'permissiontype');
    }

    public function permissionCategory(){
    	return $this->hasMany('PermissionCategory', 'id', 'permissioncategory');
    }

    public function permission(){
    	return $this->belongsTo('Permission');
    }
}