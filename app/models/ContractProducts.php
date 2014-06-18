<?php

class ContractProducts extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'contract_products';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'contract_id',
        'product_id',
        'tons',
        'bales'
    );
    
    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'contract_id' => 'required',
        'product_id' => 'required',
        'tons' => 'required',
        'bales' => 'required'
    );

}
