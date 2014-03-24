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
        return $this->hasMany('accountType', 'id', 'accounttype');
    }

    public function address(){
    	return $this->hasMany('address', 'account');
    }

    public function contact(){
        return $this->hasMany('contact', 'account', 'id', 'account');
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