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
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function weightticketscale()
    {
        return $this->belongsTo('WeightTicketScale', 'id', 'weightTicketScale_id');
    }

    public function transportscheduleproduct()
    {
        return $this->hasOne('TransportScheduleProduct','id', 'transportScheduleProduct_id');
    }
}
