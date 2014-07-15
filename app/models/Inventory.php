<?php

class Inventory extends Eloquent {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
    protected $table = 'inventory';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
		'transactiontype_id',
        'stacklocation_id',
        'weightticket_id',
        'order_id',
        'notes'
    );
    
    public static $rules = array(
		'transactiontype_id' => 'required',
        'notes' => 'max:250'
    );

    public function inventorytransactiontype(){
        return $this->hasOne('InventoryTransactionType', 'id', 'transactiontype_id');
    }

    public function inventoryproduct(){
        return $this->hasMany('InventoryProduct', 'inventory_id', 'id');
    }

    public function order(){
        return $this->hasOne('Order', 'id', 'order_id');
    }

    public function weightticket(){
        return $this->hasOne('WeightTicket', 'id', 'weightticket_id');
    }

    // public function delete(){
    //     $this->section()->delete();
    //     return parent::delete();
    // }

}
