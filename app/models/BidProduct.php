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

}