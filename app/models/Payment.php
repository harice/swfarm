<?php

class Payment extends BaseModel {

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'payment';

	public static $rules = array(
        'transactionnumber' => 'required',
        'postingdate' => 'required',
        'order_id' => 'required',
        'account_id' => 'required',
        'amount' => 'required',
    );

    /**
     * Define fillable attributes in a model.
     *
     * @var array
     */
    protected $fillable = array(
        'transactionnumber',
        'postingdate',
        'order_id',
        'account_id',
        'checknumber',
        'amount',
        'notes'
    );

   
    public function order()
    {
        return $this->hasOne('Order', 'id', 'order_id');
    }

    public function account()
    {
        return $this->hasOne('Account', 'id', 'account_id')->select(array('id', 'name'));
    }

}
