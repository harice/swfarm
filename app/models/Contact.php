<?php

class Contact extends Eloquent {
    protected $fillable = [];

    protected $table = 'contact';

    public function account(){
    	return $this->belongsTo('account');
    }
}