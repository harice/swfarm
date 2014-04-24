<?php

class Order extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'order';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'order_number',
        'location_id',
        'natureofsale_id',
        'account_id',
        'orderaddress_id',
        'dateofsale',
        'transportdatestart',
        'transportdateend',
        'status_id',
        'user_id',
        'notes',
        'isfrombid',
        'ordertype',
        'user_id',
        'created_at',
        'updated_at'
    );
    
    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $so_rules = array(
        'location_id' => 'required',
        'natureofsale_id' => 'required',
        'account_id' => 'required'
    );

    public static $po_rules = array(
        'location_id' => 'required',
        'account_id' => 'required',
        'isfrombid' => 'required'
    );
    
    public function products()
    {
        return $this->hasMany('ProductOrder', 'order_id');
    }
    
    public function account()
    {
        return $this->hasOne('Account', 'account_id');
    }
    
    public function orderaddress()
    {
        return $this->hasOne('OrderAddress');
    }
    
    public function location()
    {
        return $this->hasOne('Location');
    }
    
    public function natureofsale()
    {
        return $this->hasOne('NatureOfSale');
    }

}
