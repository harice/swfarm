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
        'ishold'
    );
    
    public static $rules = array(
        'order_id' => 'required',
        'product_id' => 'required',
        'description' => 'max:250',
        'stacknumber' => 'required',
        'tons' => 'required',
        'bales' => 'required'
    );
    
    public function salesOrder()
    {
        return $this->belongsTo('SalesOrder', 'salesorder_id');
    }
    
    public function product()
    {
        return $this->belongsTo('Product', 'product_id');
    }

    public function order(){
        return $this->belongsTo('Order', 'order_id');
    }

}
