<?php

/**
 * Description of Inventory Transaction Type
 *
 * @author Avs
 */
class InventoryTransactionType extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'inventorytransactiontype';

    
    public function inventory()
    {
        return $this->belongsTo('Inventory', 'id', 'transactiontype_id');
    }

    
}
