<?php

/**
 * Description of FarmLocation
 *
 * @author Das
 */
class Scale extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'scale';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('account_id', 'name', 'rate');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'account_id' => 'required',
        'name' => 'required|unique:scale',
        'rate' => 'required|numeric|min:0|max:10000'
    );
    
    public function account()
    {
        return $this->belongsTo('Account');
    }
    
    public function fee()
    {
        return $this->morphOne('Fee', 'entity');
    }
    
}
