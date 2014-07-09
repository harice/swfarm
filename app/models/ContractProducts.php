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
//    protected $fillable = array(
//        'contract_number',
//        'account_id',
//        'contract_date_start',
//        'contract_date_end',
//        'user_id',
//        'status_id'
//    );
    
    public function products()
    {
        return $this->hasMany('Product', 'id', 'product_id');
    }

}
