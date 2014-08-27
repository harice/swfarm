<?php

class ProductOrderSummary extends Eloquent {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
    protected $table = 'productordersummary';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'product_id',
        'order_id',
        'tons',
        'unitprice'
    );
    
    public static $rules = array(
        'product_id' => 'required',
        'tons' => 'required',
    );
    
    public function productorder()
    {
        return $this->hasMany('ProductOrder', 'productordersummary_id', 'id');
    }
    
    public function product()
    {
        return $this->hasOne('Product', 'id', 'product_id');
    }

    public function productname()
    {
        return $this->hasOne('Product', 'id', 'product_id')->withTrashed()->select(array('id', 'name'));
    }

    public function order()
    {
        return $this->hasOne('Order', 'id', 'order_id');
    }

    public function delete(){
        $this->productorder()->delete();
        return parent::delete();
    }

}
