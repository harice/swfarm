<?php

class Bid extends Eloquent {
    protected $fillable = [];

    protected $table = 'bid';

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

}