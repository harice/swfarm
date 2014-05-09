<?php

class Account extends Eloquent {
    protected $fillable = array('name', 'website', 'description', 'phone', 'accounttype');

    protected $softDelete = true;
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'account';

    public function accountType(){
        return $this->hasMany('AccountType', 'id', 'accounttype');
    }

    public function address(){
    	return $this->hasMany('Address', 'account', 'id');
    }

    public function addressType(){
        return $this->belongsToMany('AddressType', 'address', 'account', 'type')->withTimestamps();
    }

    public function contact(){
        return $this->hasMany('Contact', 'account', 'id', 'account');
    }

    public function trailer(){
        return $this->hasMany('Trailer', 'account_id', 'id')->select(array('id', 'account_id', 'number', 'rate'));
    }

    // Laravel's equivalent to calling the constructor on a model
    public static function boot()
    {
        // make the parent (Eloquent) boot method run
        parent::boot();    

        // cause a soft delete of a account to cascade to children so they are also soft deleted
        static::deleting(function($account)
        {//var_dump($account->contact()->count());
           
                $account->contact()->delete();
                
            // $account->descriptions()->delete();
            // foreach($account->variants as $variant)
            // {
            //     $variant->options()->delete();
            //     $variant->delete();
            // }
        });
    }

}