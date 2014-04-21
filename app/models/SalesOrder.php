<?php

class SalesOrder extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'salesorder';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'so_number',
        'origin_id',
        'nature_of_sale_id',
        'customer_id',
        'address_id',
        'date_of_sale',
        'delivery_date_start',
        'delivery_date_end',
        'status',
        'notes',
        'user_id',
        'created_at',
        'updated_at'
    );
    
    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'origin_id' => 'required',
        'nature_of_sale_id' => 'required',
        'customer_id' => 'required',
        'address_id' => 'required',
        'delivery_date_start' => 'required',
        'delivery_date_end' => 'required'
    );

}
