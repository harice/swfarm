<?php

/**
 * Description of Inventory Product
 *
 * @author Avs
 */
class InventoryProduct extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'inventoryproduct';

    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = 
        array(
            'inventory_id', 
            'stack_id', 
            'price',
            'tons',
            'sectionfrom_id',
            'sectionto_id'
        );

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'inventory_id' => 'required',
        'stack_id' => 'required',
        'price' => 'required',
        'tons' => 'required'
    );
    
    public function inventory()
    {
        return $this->belongsTo('Inventory', 'inventory_id', 'id');
    }

    public function stack()
    {
        return $this->belongsTo('Stack', 'stack_id', 'id');
    }
    
    
}
