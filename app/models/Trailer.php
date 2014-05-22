<?php

/**
 * Description of FarmLocation
 *
 * @author Das
 */
class Trailer extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'trailer';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('account_id', 'number', 'rate');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'account_id' => 'required',
        'number' => 'required|unique:trailer'
    );
    
    public function fee()
    {
        return $this->morphOne('Fee', 'entity');
    }

    public function tranportschedule(){
        return $this->hasMany('TransportSchedule');
    }

    public function account(){
        return $this->hasOne('Account', 'id', 'account_id')->select('id', 'name','accounttype');
    }
    
}
