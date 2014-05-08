<?php

class TransportScheduleProduct extends Eloquent {
    protected $fillable = array('transportschedule_id', 'productorder_id','quantity');

    protected $table = 'transportscheduleproduct';

    public $timestamps = false;

    public static $rules = array(
      'transportschedule_id' => 'required',
      'productorder_id' => 'required',
      'quantity' => 'required'
    );

    public function transportschedule(){
    	return $this->belongsTo('TransportSchedule', 'transportschedule_id', 'id');
    }

}