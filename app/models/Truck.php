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
        'trucknumber' => 'required|alpha_num|unique:truck,trucknumber',
        'fee' => 'required|numeric|min:0|max:100000'
    );

    public function account(){
        return $this->hasOne('Account', 'id', 'account_id')->select(array('id', 'name'));
    }
    
    public function transportschedule()
    {
        return $this->hasMany('TransportSchedule', 'truck_id', 'id');
    }
}
