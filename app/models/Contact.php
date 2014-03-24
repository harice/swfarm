<?php

class Contact extends Eloquent {
    protected $fillable = [];

    protected $table = 'contact';

    protected $softDelete = true;

    public function account(){
    	return $this->belongsTo('account', 'account', 'id');
    }
}