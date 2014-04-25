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
        'natureofsale_id',
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
        'natureofsale_id' => 'required',
        'customer_id' => 'required',
        'delivery_date_start' => 'required',
        'delivery_date_end' => 'required'
    );
    
    public function products()
    {
        return $this->hasMany('ProductOrder', 'salesorder_id');
    }
    
    public function customer()
    {
        return $this->belongsTo('Account', 'customer_id');
    }
    
    public function address()
    {
        return $this->belongsTo('Address');
    }
    
    public function origin()
    {
        return $this->belongsTo('Origin');
    }
    
    public function natureOfSale()
    {
        return $this->belongsTo('NatureOfSale', 'natureofsale_id');
    }

}
