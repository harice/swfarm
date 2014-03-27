<?php

class AddressCity extends Eloquent {
    protected $fillable = [];

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'addresscities';

    public function address(){
        return $this->belongsTo('Address');
    }

    public function addressState(){
        return $this->belongsTo('AddressState');
    }

    public function addressZip(){
        return $this->hasMany('AddressZip', 'city', 'id');
    }

}