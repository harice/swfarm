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
    protected $fillable = array('stacknumber', 'product_id', 'location');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'stacknumber' => 'required|unique:stack',
        'product_id' => 'required',
        'location' => 'required|unique:stack'
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
    
    public function product()
    {
        return $this->belongsTo('Product');
    }
    
}
