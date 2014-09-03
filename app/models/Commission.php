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
        'rate' => 'required_if:type,2',
        'amountdue' => 'required',
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
        'amountdue',
        'type'
    );

    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function order()
    {
        return $this->hasOne('Order', 'id', 'order_id')->select(array('id', 'order_number', 'contact_id', 'account_id'));
    }

    public function weightticket()
    {
        return $this->hasOne('WeightTicket', 'id', 'weightticket_id')->select(array('id', 'weightTicketNumber', 'pickup_id', 'dropoff_id'));
    }

    public function user()
    {
        return $this->hasOne('User', 'id', 'user_id')->select(array('id', 'firstname', 'lastname', 'suffix', 'email'));
    }

}
