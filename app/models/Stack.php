<?php

/**
 * Description of FarmLocation
 *
 * @author Avs
 */
class Stack extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'stack';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('stacknumber', 'product_id', 'unitprice');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'stacknumber' => 'required',
        'product_id' => 'required',
    );
    
    
    public function product()
    {
        return $this->belongsTo('Product')->withTrashed();
    }

    public function productName()
    {
        return $this->belongsTo('Product', 'product_id', 'id')->select(array('id', 'name'))->withTrashed();
    }

    public function stacklocation(){
        return $this->hasMany('StackLocation', 'stack_id', 'id')->select(array('id', 'stack_id', 'section_id', 'tons'));
    }

    public function inventoryproduct(){
        return $this->belongsTo('InventoryProduct', 'id', 'stack_id');
    }

    public function account(){
        return $this->hasOne('Account', 'id', 'account_id')->select(array('id', 'name'));
    }
}
