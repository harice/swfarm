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
        'unloadingTicketNumber',
        'pickup_id',
        'dropoff_id'
    );

    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function weightticketscale_pickup()
    {
        return $this->hasOne('WeightTicketScale', 'id', 'pickup_id');
    }

    public function weightticketscale_dropoff()
    {
        return $this->hasOne('WeightTicketScale', 'id', 'dropoff_id');
    }

    public function transportschedule(){
        return $this->belongsTo('TransportSchedule', 'transportSchedule_id', 'id');
    }

    public function schedule(){
        return $this->belongsTo('TransportSchedule', 'transportSchedule_id', 'id')->select(array('id', 'order_id'));
    }

    public function status()
    {
        return $this->hasOne('Status', 'id', 'status_id');
    }

    public function commission(){
        return $this->hasOne('Commission', 'weightticket_id', 'id');
    }

    public function delete(){
        $this->weightticketscale_pickup()->delete();
        $this->weightticketscale_dropoff()->delete();
        return parent::delete();
    }



    public static function boot()
    {
        parent::boot();

        static::created(function($weighticket)
        {  
            NotificationLibrary::pushNotification(Config::get('constants.ORDER_WEIGHTTICKET_CREATED_NOTIFICATIONTYPE'), $weighticket->id);
        });

        static::updated(function($weighticket)
        {  
            NotificationLibrary::pushNotification(Config::get('constants.ORDER_WEIGHTTICKET_UPDATED_NOTIFICATIONTYPE'), $weighticket->id);
        });
    }

}
