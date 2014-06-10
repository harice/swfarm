<?php

class OrderCancellingReason extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'ordercancellingreason';
	public $timestamps = false;
	/**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'order',
        'reason',
        'others'
    );
    
    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'order' => 'required',
        'reason' => 'required'
    );

    public function order(){
        return $this->hasOne('Order', 'id','order');
    }

    public function reason(){
        return $this->hasOne('Reason', 'id','reason');
    }

}
