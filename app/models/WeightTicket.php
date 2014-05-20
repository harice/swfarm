<?php

class WeightTicket extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightticket';

	public static $rules = array(
        'transportSchedule_id' => 'required'
    );

    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'transportSchedule_id', 
        'weightTicketNumber', 
        'loadingTicketNumber', 
        'pickup_id', 
        'dropoff_id'
    );
    
    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function weightticketscale()
    {
        return $this->hasOne('weightticketscale');
    }

    public function transportschedule(){
        return $this->belongsTo('transportschedule', 'id', 'transportschedule_id');
    }

}
