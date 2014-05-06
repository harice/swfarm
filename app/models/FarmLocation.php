<?php

/**
 * Description of FarmLocation
 *
 * @author Das
 */
class FarmLocation extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'farmlocation';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('locationnumber', 'status');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'locationnumber' => 'required|unique:farmlocation,locationnumber',
        'status' => 'required'
    );
    
    /**
     * Define relationship with Stack model.
     * 
     * @return type
     */
    public function stack()
    {
        return $this->hasOne('Stack', 'farmlocation_id');
    }
    
}
