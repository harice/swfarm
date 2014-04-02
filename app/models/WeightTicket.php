<?php

class WeightTicket extends Eloquent {
    
    protected $fillable = array('bidproduct', 'weighttickettype', 'bales', 'gross', 'tare');

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightticket';

    public function weightTicketType(){
        return $this->hasOne('WeightTicketType', 'id', 'weighttickettype_id');
    }

}