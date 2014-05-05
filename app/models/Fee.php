<?php

/**
 * Description of FarmLocation
 *
 * @author Das
 */
class Fee extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'fee';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('account_id', 'type', 'fee');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'account_id' => 'required',
        'type' => 'required',
        'fee' => 'required'
    );
    
}
