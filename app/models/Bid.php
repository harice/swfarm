<?php

class Bid extends Eloquent {
    protected $fillable = [];

    protected $table = 'bid';

    public function account(){
    	return $this->hasOne('Account', 'account_id', 'id');
    }

    public function users(){
        return $this->hasOne('Users', 'user_id', 'id');
    }

    public function bidproduct(){
    	return $this->hasMany('BidProduct', 'id', 'bid_id');
    }

    public function address(){
        return $this->hasOne('Address', 'address_id', 'id');
    }

    public function product(){
        return $this->belongsToMany('Product','bidproduct','bid_id','product_id');
    }

}