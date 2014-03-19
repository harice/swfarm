<?php

class Account extends Eloquent {
    protected $fillable = array('name', 'website', 'description', 'phone', 'accounttype');

    protected $softDelete = true;
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'account';

    public function accountType(){
        return $this->hasMany('accountType', 'id', 'accounttype');
    }

    public function address(){
    	return $this->hasMany('address', 'account');
    }

    public function contact(){
        return $this->hasMany('contact', 'account');
    }

}