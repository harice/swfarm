<?php

class TransportSchedule extends Eloquent {

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'transportschedule';

    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'order_id',
        'date',
        'trucker_id',
        'trailer_id',
        'distance',
        'fuelcharge',
        'originloader_id',
        'originloadersfee',
        'destinationloader_id',
        'destinationloadersfee',
        'truckingrate',
        'type',
        'created_at',
        'updated_at'
    );

    /**
     * Define field validation rules.
     * 
     * @var array
     */
    public static $rules = array(
      'order_id' => 'required',
      'scheduledate' => 'required|date',
      'scheduletimeHour' => 'required',
      'scheduletimeMin' => 'required',
      'scheduletimeAmPm' => 'required',
      'trucker_id' => 'required',
      'distance' => 'required',
      'fuelcharge' => 'required',
      'originloader_id' => 'required',
      'originloaderfee' => 'required',
      'destinationloader_id' => 'required',
      'destinationloaderfee' => 'required',
    );

    public function order(){
        return $this->belongsTo('order');
    }

    // public function trucker(){
    //     return $this->hasMany('Account', 'id', 'trucker_id');
    // }

    // public function originLoader(){
    //     return $this->hasMany('Account', 'id', 'originloader_id');
    // }

    // public function destinationLoader(){
    //     return $this->hasMany('Account', 'id', 'destinationloader_id');
    // }

    public function trucker(){
        return $this->hasOne('Contact', 'id', 'trucker_id')->select(array('id','firstname','lastname','suffix','account'));
    }

    public function originloader(){
        return $this->hasOne('Contact', 'id', 'originloader_id')->select(array('id','firstname','lastname','suffix','account'));
    }

    public function destinationloader(){
        return $this->hasOne('Contact', 'id', 'destinationloader_id')->select(array('id','firstname','lastname','suffix','account'));
    }

    public function weightticket(){
        return $this->hasOne('WeightTicket', 'pickupschedule_id', 'id');
    }

    public function trailer(){
        return $this->hasOne('Trailer', 'id', 'trailer_id')->select(array('id','name'));
    }
}