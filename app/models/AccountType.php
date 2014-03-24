<?php

class AccountType extends Eloquent {
    protected $fillable = [];

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'accounttype';

    public function account(){
        return $this->belongsTo('Account');
    }

}