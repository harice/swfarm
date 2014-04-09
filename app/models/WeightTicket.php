<?php

class WeightTicket extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightticket';

	public static $rules = array(
        'po_id' => 'required',
        'product' => 'required'
    );

}

