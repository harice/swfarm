<?php

class Contact extends Eloquent {
    protected $fillable = [];

    protected $table = 'contact';

    protected $softDelete = true;
    
    protected $appends = array('fullname');

    public function account(){
    	return $this->belongsTo('Account', 'account', 'id');
    }

    public function accountidandname(){
    	return $this->belongsTo('Account', 'account', 'id')->select(array('id', 'name','accounttype'));
    }
    
    public function loadOrigin()
    {
        return $this->hasMany('TransportSchedule', 'originloader_id', 'id');
    }
    
    public function loadDestination()
    {
        return $this->hasMany('TransportSchedule', 'destinationloader_id', 'id');
    }
    
    public function getFullnameAttribute()
    {
        return $this->attributes['lastname'] .', ' .$this->attributes['firstname'] .$this->attributes['suffix'];
    }
}