<?php

class PermissionType extends Eloquent {
    protected $fillable = [];

    protected $table = 'permissiontype';

    public function permissionCategoryType(){
    	return $this->belongsTo('PermissionCategoryType');
    }
}