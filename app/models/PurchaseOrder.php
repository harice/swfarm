<?php

class PurchaseOrder extends Eloquent {
    protected $fillable = [];

    protected $table = 'purchaseorder';

    protected $softDelete = true;

    public function account(){
    	return $this->hasOne('Bid', 'bid_id', 'id');
    }

}