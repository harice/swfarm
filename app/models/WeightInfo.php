<?php

class WeightInfo extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightinfo';

	public static $rules = array(
        'gross' => 'required',
        'tare' => 'required',
        'scale' => 'required',
        'scale_fee' => 'required'
    );

}

