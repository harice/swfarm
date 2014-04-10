<?php

class PickupSchedule extends Eloquent {
    protected $fillable = [];

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'pickupschedule';

    public function bid(){
        return $this->belongsTo('bid');
    }

    public function trucker(){
        return $this->hasMany('Account', 'id', 'trucker_id');
    }

    public function originLoader(){
        return $this->hasMany('Account', 'id', 'originloader_id');
    }

    public function destinationLoader(){
        return $this->hasMany('Account', 'id', 'destinationloader_id');
    }

    public function weightticket(){
        return $this->hasMany('WeightTicket', 'pickupschedule_id', 'id');
    }
}