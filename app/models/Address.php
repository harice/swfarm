<?php

class Address extends Eloquent {
    protected $fillable = array('account', 'street', 'city', 'state', 'country',  'type', 'longitude', 'latitude');

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'address';

    protected $softDelete = true;

    public function addressType(){
        return $this->hasMany('AddressType', 'id', 'type');
    }

    public function account(){
    	return $this->belongsTo('Account', 'account', 'id');
    }

    public function addressStates(){
        return $this->hasMany('AddressStates', 'id','state');
    }

    public function state(){
        return $this->hasOne('AddressStates', 'id','state');
    }

    public function storagelocation()
    {
        return $this->belongsTo('StorageLocation', 'address_id', 'id');
    }

}