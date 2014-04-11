<?php

class AddressZip extends Eloquent {
    protected $fillable = [];

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'addresszip';

    public function addressCity(){
        return $this->belongsTo('AddressCity');
    }

}