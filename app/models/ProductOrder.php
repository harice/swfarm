<?php

class ProductOrder extends Eloquent {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
    protected $table = 'productorder';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
		'order_id',
        'product_id',
        'description',
        'stacknumber',
        'tons',
        'bales',
        'unitprice',
        'ishold',
        'rfv'
    );
    
    public static $rules = array(
		'order_id' => 'required',
        'product_id' => 'required',
        'description' => 'max:250',
        'stacknumber' => 'required',
        'tons' => 'required',
        'bales' => 'required'
        // ,'rfv' => 'required_if:ishold,1'
    );
    
    public function salesOrder()
    {
        return $this->belongsTo('SalesOrder', 'salesorder_id');
    }
    
    public function product()
    {
        return $this->belongsTo('Product', 'product_id')->select(array('id', 'name'));
    }

    public function order(){
        return $this->belongsTo('Order', 'order_id');
    }

    public function upload(){
        return $this->hasMany('Upload', 'entity_id', 'id');
    }

    public function transportscheduleproduct(){
        return $this->hasMany('TransportScheduleProduct', 'productorder_id', 'id');
    }

}
