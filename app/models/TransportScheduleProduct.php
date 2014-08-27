<?php

class TransportScheduleProduct extends Eloquent {
    protected $fillable = array('transportschedule_id', 'productorder_id','quantity','sectionto_id');

    protected $table = 'transportscheduleproduct';

    public $timestamps = false;

    public static $rules = array(
      'transportschedule_id' => 'required',
      'productorder_id' => 'required',
      'quantity' => 'required',
      'sectionto_id'=> 'required'
    );

    public function transportschedule(){
    	return $this->belongsTo('TransportSchedule', 'transportschedule_id', 'id');
    }

    public function productorder(){
        return $this->hasOne('ProductOrder', 'id', 'productorder_id');
    }

    public function weightticketproducts(){
        return $this->hasMany('WeightTicketProducts', 'transportScheduleProduct_id', 'id');
    }

    public function sectionto(){
        return $this->hasOne('Section', 'id', 'sectionto_id');
    }

}