<?php

class WeightTicket extends BaseModel implements WeightTicketInterface {
    
    protected $fillable = array('bidproduct', 'weighttickettype', 'bales', 'gross', 'tare');

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightticket';

    public function weightTicketType()
    {
        return $this->hasOne('WeightTicketType', 'id', 'weighttickettype_id');
    }

}