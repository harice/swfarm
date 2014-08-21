<?php

class TransportMap extends Eloquent {

    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'transportmap';

    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'transportschedule_id',
        'sequenceNo',
        'longitudeFrom',
        'latitudeFrom',
        'longitudeTo',
        'latitudeTo',
        'distance',
        'isLoadedDistance'
    );

    /**
     * Define field validation rules.
     * 
     * @var array
     */
    public static $rules = array(
      'transportschedule_id' => 'required',
      'sequenceNo' => 'required',
      'longitudeFrom' => 'required',
      'latitudeFrom' => 'required',
      'longitudeTo' => 'required',
      'latitudeTo' => 'required',
      'distance' => 'required',
      'isLoadedDistance' => 'required'
    );

    public function transportschedule(){
        return $this->belongsTo('transportschedule');
    }

}