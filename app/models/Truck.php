<?php

/**
 * Description of FarmLocation
 *
 * @author Das
 */
class Truck extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'truck';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('account_id', 'name', 'rate');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'account_id' => 'required',
        'name' => 'required|unique:truck,name',
        'rate' => 'required'
    );
    
}
