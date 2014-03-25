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
        return $this->hasMany('AddressType', 'id', 'type');
    }

    public function account(){
    	return $this->belongsTo('Account');
    }

    public function addressCity(){
        return $this->hasMany('AddressCity', 'id', 'city');
    }

    public function addressStates(){
        return $this->hasMany('AddressStates', 'id','state');
    }

}