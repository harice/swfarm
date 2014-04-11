<?php

class Bid extends Eloquent {
    protected $fillable = [];

    protected $table = 'bid';

    protected $softDelete = true;

    public function account(){
    	return $this->hasOne('Account', 'id', 'producer_id');
    }

    public function users(){
        return $this->hasOne('Users', 'user_id', 'id');
    }

    public function bidproduct(){
    	return $this->hasMany('BidProduct', 'bid_id', 'id');
    }

    public function destination(){
        return $this->hasOne('Destination', 'id', 'destination_id');
    }

    public function address(){
        return $this->hasOne('Address', 'id', 'address_id');
    }

    public function product(){
        return $this->belongsToMany('Product','bidproduct','bid_id','product_id');
    }

    public function purchaseOrder(){
        return $this->hasOne('PurchaseOrder', 'bid_id', 'id');
    }

    public function pickupschedule(){
        return $this->hasMany('PickupSchedule', 'bid_id', 'id');
    }

}