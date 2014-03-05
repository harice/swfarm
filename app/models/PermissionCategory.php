<?php

class PermissionCategory extends Eloquent {
    protected $fillable = [];

    protected $table = 'permissioncategory';

    public function permissionCategoryType(){
    	return $this->belongsTo('PermissionCategoryType');
    }
}