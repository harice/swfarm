<?php

class Contact extends Eloquent {
    protected $fillable = [];

    protected $table = 'contact';

    protected $softDelete = true;

    public function account(){
    	return $this->belongsTo('Account', 'account', 'id');
    }

    public function accountidandname(){
    	return $this->belongsTo('Account', 'account', 'id')->select(array('id', 'name'));
    }
    
    public function loadOrigin()
    {
        return $this->hasMany('TransportSchedule', 'originloader_id', 'id');
    }
    
    public function loadDestination()
    {
        return $this->hasMany('TransportSchedule', 'destinationloader_id', 'id');
    }

    // test
    public function transportschedule()
    {
        return $this->hasMany('TransportSchedule','trucker_id','id');
    }

    public function order()
    {
        return $this->hasMany('transportschedule','trucker_id','id')->join('order','order.id','=','transportschedule.order_id')->groupBy('transportschedule.order_id');
    }
}