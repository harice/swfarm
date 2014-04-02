<?php

class WeightTicketType extends Eloquent {
    protected $fillable = [];

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weighttickettype';

    public function weightTicket(){
        return $this->belongsTo('WeightTicket');
    }

}