<?php

class WeightInfo extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightinfo';

	public static $rules = array(
        'weightticket_id' => 'required',
        'weightinfo_type' => 'required',
        'gross' => 'required',
        'tare' => 'required',
        'scale' => 'required',
        'scale_fee' => 'required'
    );
    
    /**
     * Define the relationship with the weightticket table
     * @return Model parent WeightTicket model
     */
    public function weightticket()
    {
        return $this->belongsTo('WeightTicket');
    }

}
