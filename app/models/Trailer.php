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
    protected $fillable = array('account_id', 'name');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'account_id' => 'required',
        'name' => 'required'
    );
    
    public function fee()
    {
        return $this->morphOne('Fee', 'entity');
    }

    public function tranportschedule(){
        return $this->hasMany('TransportSchedule');
    }
    
}
