<?php

class WeightTicketProducts extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightticketproducts';

	public static $rules = array(
        'weightTicketScale_id' => 'required',
        'transportScheduleProduct_id' => 'required',
        'bales' => 'required',
        'pounds' => 'required'
    );

    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'weightTicketScale_id', 
        'transportScheduleProduct_id', 
        'bales', 
        'pounds'
    );
    
    /**
     * Append custom attributes
     * 
     * @var array
     */
    protected $appends = array('tons', 'total_price');

    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function weightticketscale()
    {
        return $this->belongsTo('WeightTicketScale', 'weightTicketScale_id', 'id');
    }

    public function weightticketscale_type()
    {
        return $this->belongsTo('WeightTicketScale', 'weightTicketScale_id', 'id')->select(array('id', 'type'));
    }

    public function transportscheduleproduct()
    {
        return $this->hasOne('TransportScheduleProduct','id', 'transportScheduleProduct_id');
    }
    
    /**
     * Get the product's weight in tons through pounds
     * 
     * @return float
     */
    public function getTonsAttribute()
    {
        return $this->attributes['tons'] = $this->attributes['pounds'] * 0.0005;
    }
    
    /**
     * Get total price
     * 
     * @return float
     */
    public function getTotalPriceAttribute()
    {
//        return $this->attributes['total_price'] = $this->attributes['tons'] * $this->attributes['unitprice'];
        return 0;
    }
}
