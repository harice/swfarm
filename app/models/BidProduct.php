<?php

class BidProduct extends Eloquent {
    protected $fillable = [];

    protected $table = 'bidproduct';

    public function bid(){
    	return $this->hasOne('Bid', 'bid_id', 'id');
    }

    public function products(){
        return $this->hasMany('Products', 'product_id', 'id');
    }

}