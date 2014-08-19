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
        'rfv',
        'productordersummary_id',
        'section_id'
    );
    
    /**
     * Append custom attributes
     * 
     * @var float 
     */
    protected $appends = array('total_price');

    public static $rules = array(
		'order_id' => 'required',
        'product_id' => 'required',
        'description' => 'max:250',
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

    public function transportscheduleproduct(){
        return $this->hasMany('TransportScheduleProduct', 'productorder_id', 'id');
    }

    public function productordersummary(){
        return $this->hasOne('ProductOrderSummary', 'id', 'productordersummary_id');
    }

    public function sectionfrom(){
        return $this->hasOne('Section', 'id', 'section_id');
    }
    
    /**
     * Get total price
     * 
     * @return float
     */
    public function getTotalPriceAttribute()
    {
        return $this->attributes['total_price'] = (float) $this->attributes['tons'] * $this->attributes['unitprice'];
    }
}
