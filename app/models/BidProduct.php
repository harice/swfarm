<?php

class BidProduct extends Eloquent {
    protected $fillable = [];

    protected $table = 'bidproduct';

    public function bid(){
    	return $this->hasOne('Bid', 'id', 'bid_id');
    }

    public function product(){
        return $this->hasMany('Product', 'id', 'product_id');
    }

    public function product_id_name(){
        return $this->hasMany('Product', 'id', 'product_id')->select(array('id', 'name'));
    }

    public function purchaseOrder(){
    	return $this->hasOne('PurchaseOrder', 'id', 'bid_id');
    }

}