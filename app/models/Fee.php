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
    protected $fillable = array('entity_id', 'entity_type', 'fee');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'entity_id' => 'required',
        'entity_type' => 'required',
        'fee' => 'required'
    );
    
    public function entity()
    {
        return $this->morphTo();
    }
    
}
