<?php

class WeightTicket extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'weightticket';

	public static $rules = array(
        'purchaseorder_id' => 'required',
        'pickupschedule_id' => 'required',
        'bidproduct_id' => 'required'
    );
    
    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function weightinfo()
    {
        return $this->hasMany('WeightInfo');
    }

    public function pickupschedule(){
        return $this->hasOne('pickupschedule', 'id', 'pickupschedule_id');
    }

    public function originScalerAccount(){
        return $this->hasOne('Account', 'id', 'origin_account_id')->select(array('id', 'name'));
    }

    public function destinationScalerAccount(){
        return $this->hasOne('Account', 'id', 'destination_account_id')->select(array('id', 'name'));
    }

}
