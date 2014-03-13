<?php

class AddressType extends Eloquent {
    protected $fillable = [];

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'addresstype';

    public function address(){
        return $this->belongsTo('Address');
    }

}