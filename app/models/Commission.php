<?php

class Commission extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'commission';

	public static $rules = array(
        'order_id' => 'required',
        'weightticket_id' => 'required',
        'user_id' => 'required',
        'tons' => 'required',
        'rate' => 'required',
        'type' => 'required'
    );

    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'order_id', 
        'weightticket_id',
        'user_id', 
        'tons', 
        'rate', 
        'type'
    );
    
    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function order()
    {
        return $this->hasOne('Order', 'id', 'order_id');
    }

    public function weightticket()
    {
        return $this->hasOne('WeightTicket', 'id', 'weightticket_id');
    }

    public function user()
    {
        return $this->hasOne('User', 'id', 'user_id');
    }

}
