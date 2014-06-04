<?php

class Reason extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'reason';
	public $timestamps = false;
	/**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'reason'
    );
    
    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'reason' => 'required'
    );

    public function ordercancellingreason(){
        return $this->belongsTo('OrderCancellingReason', 'id','reason');
    }

}
