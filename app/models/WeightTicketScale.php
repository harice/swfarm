<?php

class WeightTicketScale extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightticketscale';

	public static $rules = array(
        'scaleAccount_id' => 'required',
        'scale_id' => 'required',
        'fee' => 'required',
        'bales' => 'required',
        'gross' => 'required',
        'tare' => 'required'
    );

    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'scaleAccount_id', 
        'scale_id',
        'fee', 
        'bales', 
        'gross', 
        'tare',
        'type'
    );
    
    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function dropoff()
    {
        return $this->belongsTo('WeightTicket', 'id', 'dropoff_id');
    }

    public function pickup()
    {
        return $this->belongsTo('WeightTicket', 'id', 'pickup_id');
    }

    public function weightticketproducts(){
        return $this->hasMany('WeightTicketProducts', 'weightTicketScale_id', 'id');
    }

    public function scalerAccount(){
        return $this->hasMany('account', 'id', 'scaleAccount_id');
    }

    public function scale(){
        return $this->hasOne('scale', 'id', 'scale_id');
    }

    public function delete(){
        $this->weightticketproducts()->delete();
        return parent::delete();
    }

}
