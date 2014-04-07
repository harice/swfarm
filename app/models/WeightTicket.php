<?php

class WeightTicket extends BaseModel implements WeightTicketInterface {
    
    protected $fillable = array('weighttickettype_id', 'bales', 'gross', 'tare', 'net');

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightticket';
    
    public static $rules = array(
        'weighttickettype_id' => 'required',
        'bales' => 'sometimes|required',
        'gross' => 'required',
        'tare' => 'required'
    );

    public function weightTicketType()
    {
        return $this->hasOne('WeightTicketType', 'id', 'weighttickettype_id');
    }

}