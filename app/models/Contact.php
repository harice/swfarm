<?php

class Contact extends Eloquent {
    protected $fillable = [];

    protected $table = 'contact';

    protected $softDelete = true;

    public function account(){
    	return $this->belongsTo('Account', 'account', 'id');
    }

    public function accountidandname(){
    	return $this->belongsTo('Account', 'account', 'id')->select(array('id', 'name','accounttype'));
    }
}