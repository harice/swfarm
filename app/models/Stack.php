<?php

/**
 * Description of FarmLocation
 *
 * @author Avs
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
    protected $fillable = array('stacknumber', 'product_id');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'stacknumber' => 'required',
        'product_id' => 'required',
    );
    
    
    public function product()
    {
        return $this->belongsTo('Product');
    }
    
    public function stacklocation(){
        return $this->hasMany('StackLocation', 'id', 'stack_id');
    }
}
