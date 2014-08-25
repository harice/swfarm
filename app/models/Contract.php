<?php

class Contract extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'contract';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'contract_number',
        'account_id',
        'contract_date_start',
        'contract_date_end',
        'user_id',
        'status_id'
    );
    
    /**
     * Add an array of attributes that do not have a corresponding column in
     * the database.
     * 
     * @var type 
     */
    protected $appends = array('total_delivered');
    
    /**
     * Get the delivered quantity for this Contract.
     * 
     * @return type
     */
    public function getTotalDeliveredAttribute()
    {
        return $this->attributes['total_delivered'] = '0.0000';
    }

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'contract_number' => 'required|unique:contract,contract_number',
        'account_id' => 'required',
        'contract_date_start' => 'required',
        'contract_date_end' => 'required',
        'user_id' => 'required'
    );
    
    /**
     * Define a Many To Many Relationship
     * 
     * A Contract has many Products and Products can belong to many Contracts.
     * 
     * @return Model
     */
    public function products()
    {
        return $this->belongsToMany('Product', 'contract_products')->withPivot('tons', 'bales')->withTrashed();
    }
    
    public function contractproducts()
    {
        return $this->hasMany('ContractProducts', 'contract_id', 'id');
    }
    
    /**
     * Define a One To Many Relationship
     * 
     * The contract can only belong to one account.
     * 
     * @return Model
     */
    public function account()
    {
        return $this->belongsTo('Account');
    }

    public function accountname()
    {
        return $this->belongsTo('Account', 'account_id', 'id')->select(array('id', 'name'));
    }
    
    /**
     * The user who created this contract
     * 
     * @return Model
     */
    public function user()
    {
        return $this->belongsTo('User');
    }
    
    /**
     * Define a One to Many Relationship
     * 
     * Each contract can have multiple Sales Orders.
     * 
     * @return Model
     */
    public function salesorders()
    {
        return $this->hasMany('Order');
    }
    
    public function productorders()
    {
        return $this->hasManyThrough('ProductOrder', 'Order', 'contract_id', 'order_id');
    }
    
    public function schedules()
    {
        return $this->hasManyThrough('TransportSchedule', 'Order', 'contract_id', 'order_id');
    }
    
    public function order()
    {
        return $this->hasMany('Order', 'contract_id', 'id');
    }

    /**
     * Define a One-to-One Relationship
     * 
     * Contract status (Open/Closed)
     * 
     * @return Model
     */
    public function status()
    {
        return $this->belongsTo('Status');
    }
    
    /**
     * Make dates compatible with Carbon
     * 
     * @return array
     */
    public function getDates()
    {
        return array('created_at', 'updated_at', 'contract_date_start', 'contract_date_end');
    }

}
