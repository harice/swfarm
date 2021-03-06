<?php

class Order extends BaseModel {

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'order';

    protected $softDelete = true;

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
        'contact_id',
        'orderaddress_id',
        'transportdatestart',
        'transportdateend',
        'status_id',
        'user_id',
        'contract_id',
        'verified',
        'notes',
        'isfrombid',
        'ordertype',
        'purchaseorder_id',
        'user_id',
        'totalPayment',
        'created_at',
        'updated_at'
    );

    /**
     * Define field validation rules.
     *
     * @var array
     */
	public static $so_rules = array(
        'natureofsale_id' => 'required',
        'account_id' => 'required',
        'contact_id' => 'required'
    );

    public static $po_rules = array(
        'account_id' => 'required',
        'contact_id' => 'required'
    );

    public function productorder()
    {
        return $this->hasMany('ProductOrder', 'order_id', 'id');
    }

    public function account(){
        return $this->hasOne('Account', 'id', 'account_id')->select(array('id', 'name'))->withTrashed();
    }

    public function orderaddress()
    {
        return $this->hasOne('OrderAddress', 'id', 'orderaddress_id');
    }

    public function location()
    {
        return $this->hasOne('Location', 'id', 'location_id');
    }

    public function natureofsale()
    {
        return $this->hasOne('NatureOfSale', 'id', 'natureofsale_id');
    }

    public function status()
    {
        return $this->hasOne('Status', 'id', 'status_id');
    }

    public function transportschedule(){
        return $this->hasMany('TransportSchedule', 'order_id', 'id');
    }

    public function ordercancellingreason(){
        return $this->hasOne('OrderCancellingReason', 'order', 'id');
    }

    public function contract()
    {
        return $this->belongsTo('Contract');
    }

    public function contractnumber(){
        return $this->belongsTo('Contract', 'contract_id', 'id')->select(array('id', 'contract_number','account_id'));
    }

    public function contact(){
        return $this->hasOne('Contact', 'id', 'contact_id')->select(array('id', 'firstname', 'lastname', 'suffix'));
    }

    public function productsummary(){
        return $this->hasMany('ProductOrderSummary', 'order_id', 'id')->select(array('id', 'product_id', 'order_id', 'tons', 'unitprice'));
    }

    public function userfullname(){
        return $this->hasOne('User', 'id', 'user_id')->select(array('id', 'firstname', 'lastname', 'suffix'));
    }

    public function purchaseorder()
    {
        return $this->hasOne('Order', 'id', 'purchaseorder_id');
    }

    public function payment()
    {
        return $this->hasMany('Payment', 'order_id', 'id');
    }

    public function ordertype()
    {
        return $this->ordertype;
    }


    /**
     * Make dates compatible with Carbon
     * 
     * @return array
     */
    public function getDates()
    {
        return array('created_at', 'updated_at');
    }

    public static function boot()
    {
        parent::boot();

        static::created(function($order)
        {  
            NotificationLibrary::pushNotification(Config::get('constants.ORDER_CREATED_NOTIFICATIONTYPE'), $order->id);
        });

        static::updated(function($order)
        {  
            NotificationLibrary::pushNotification(Config::get('constants.ORDER_UPDATED_NOTIFICATIONTYPE'), $order->id);
        });
    }
}
