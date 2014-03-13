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
        return $this->hasMany('addressType', 'type');
    }

    public function account(){
    	return $this->belongsTo('account');
    }

}