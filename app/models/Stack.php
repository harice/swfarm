<?php

/**
 * Description of FarmLocation
 *
 * @author Das
 */
class Stack extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'stack';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('stacknumber', 'product_id', 'farmlocation_id', 'notes');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'stacknumber' => 'required',
        'product_id' => 'required',
        'farmlocation_id' => 'required'
    );
    
    /**
     * Define relationship with FarmLocation model.
     * 
     * @return type
     */
    public function farmlocation()
    {
        return $this->belongsTo('FarmLocation');
    }
    
}
