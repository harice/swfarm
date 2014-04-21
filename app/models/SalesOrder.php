<?php

class SalesOrder extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'salesorder';

	public static $rules = array(
        'origin_id' => 'required',
        'nature_of_sale_id' => 'required',
        'customer_id' => 'required',
        'address_id' => 'required',
        'delivery_date_start' => 'required',
        'delivery_date_end' => 'required'
    );

}
