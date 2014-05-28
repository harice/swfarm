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
        'status_id', 
        'weightTicketNumber', 
        'loadingTicketNumber', 
        'pickup_id', 
        'dropoff_id'
    );
    
    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function weightticketscale_pickup()
    {
        return $this->hasOne('weightticketscale', 'id', 'pickup_id');
    }

    public function weightticketscale_dropoff()
    {
        return $this->hasOne('weightticketscale', 'id', 'dropoff_id');
    }

    public function transportschedule(){
        return $this->belongsTo('transportschedule', 'id', 'transportschedule_id');
    }

    public function delete(){
        $this->weightticketscale_pickup()->delete();
        $this->weightticketscale_dropoff()->delete();
        return parent::delete();
    }

}
