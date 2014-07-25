<?php

class ContractProducts extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'contract_products';
    
    public function products()
    {
        return $this->hasMany('Product', 'id', 'product_id');
    }
    
    public function contract()
    {
        return $this->belongsTo('Contract', 'product_id', 'id');
    }

}
