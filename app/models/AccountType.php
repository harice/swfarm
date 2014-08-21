<?php

class Accounttype extends Eloquent {
    protected $fillable = [];

    protected $touches = array('account');
    
	protected $table = 'accounttype';

}