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
        return $this->belongsTo('Product', 'product_id');
    }

    public function order(){
        return $this->belongsTo('Order', 'order_id', 'id');
    }

    public function transportscheduleproduct(){
        return $this->hasMany('TransportScheduleProduct', 'productorder_id', 'id');
    }

    public function productordersummary(){
        return $this->belongsTo('ProductOrderSummary', 'id', 'productordersummary_id');
    }

    public function sectionfrom(){
        return $this->hasOne('Section', 'id', 'section_id');
    }
    
    public function document()
    {
        return $this->morphOne('Document','documentable');
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
