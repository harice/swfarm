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
        'truckerAccountType_id',
        'trucker_id',
        'truck_id',
        'trailer_id',
        'distance',
        'fuelcharge',
        'originloader_id',
        'originloaderfee',
        'destinationloader_id',
        'destinationloaderfee',
        'truckingrate',
        'trailerrate',
        'adminfee',
        'type',
        'status_id',
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
      'truckerAccountType_id' => 'required',
      'trucker_id' => 'required',
      'truck_id' => 'required',
      'distance' => 'required',
      'originloader_id' => 'required',
      'originloaderfee' => 'required',
      'destinationloader_id' => 'required',
      'destinationloaderfee' => 'required',
    );

    public function order(){
        return $this->belongsTo('order');
    }

    public function orderdetails(){
        return $this->belongsTo('order', 'order_id', 'id')->select(array('id', 'order_number', 'account_id', 'contact_id', 'status_id', 'user_id'));
    }

    // public function trucker(){
    //     return $this->hasMany('Account', 'id', 'trucker_id');
    // }

    // public function originLoader(){
    //     return $this->hasMany('Account', 'id', 'originloader_id');
    // }

    public function transportmap(){
        return $this->hasMany('TransportMap', 'transportschedule_id', 'id');
    }

    public function trucker(){
        return $this->hasOne('Contact', 'id', 'trucker_id')->select(array('id','firstname','lastname','suffix','account'));
    }

    public function truckvehicle(){
        return $this->hasOne('Truck', 'id', 'truck_id')->select(array('id','trucknumber','fee'));
    }
    
    public function truck(){
        return $this->hasOne('Truck', 'id', 'truck_id')->select(array('id','trucknumber','fee'));
    }

    public function originloader(){
        return $this->hasOne('Contact', 'id', 'originloader_id')->select(array('id','firstname','lastname','suffix','account'));
    }

    public function destinationloader(){
        return $this->hasOne('Contact', 'id', 'destinationloader_id')->select(array('id','firstname','lastname','suffix','account'));
    }

    public function weightticket(){
        return $this->hasOne('WeightTicket', 'transportSchedule_id', 'id');
    }

    public function trailer(){
        return $this->hasOne('Trailer', 'id', 'trailer_id')->select(array('id','account_id','number','rate'));
    }

    public function status()
    {
        return $this->hasOne('Status', 'id', 'status_id');
    }

    public function transportscheduleproduct(){
      return $this->hasMany('TransportScheduleProduct', 'transportschedule_id', 'id');
    }
}