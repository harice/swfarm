<?php

class AddressState extends Eloquent {
    protected $fillable = [];

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'addressstate';

    public function address(){
        return $this->belongsTo('Address');
    }

}