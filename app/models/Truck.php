<?php

/**
 * Description of Truck
 *
 * @author Avs
 */
class Truck extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'truck';

    protected $softDelete = true;
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('account_id', 'trucknumber', 'fee');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'account_id' => 'required',
        'trucknumber' => 'required|unique:truck,trucknumber',
        'fee' => 'required'
    );

    public function account(){
        return $this->hasOne('Account', 'id', 'account_id')->select(array('id', 'name', 'accounttype'));
    }
    
}
