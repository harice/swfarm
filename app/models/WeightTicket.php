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
    
    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function weightinfo()
    {
        return $this->hasMany('WeightInfo');
    }

}
