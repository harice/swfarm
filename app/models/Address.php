<?php

class Address extends Eloquent {
    protected $fillable = array('account', 'street', 'city', 'state', 'country',  'type');

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'address';

    public function addressType(){
        return $this->hasMany('AddressType', 'type');
    }

    public function account(){
    	return $this->belongsTo('Account');
    }

    public function addressCity(){
        return $this->hasMany('AddressCity');
    }

    public function addressState(){
        return $this->hasMany('AddressState');
    }

}