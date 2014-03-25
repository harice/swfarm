<?php

class AddressStates extends Eloquent {
    protected $fillable = [];

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'addressstates';

    public function address(){
        return $this->belongsTo('Address');
    }

}