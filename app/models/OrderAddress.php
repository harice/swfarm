<?php

class OrderAddress extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'orderaddress';
	public $timestamps = false;
	/**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'street',
        'city',
        'state',
        'zipcode'
    );
    
    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'street' => 'required',
        'city' => 'required',
        'state' => 'required',
        'zipcode' => 'required'
    );

}
