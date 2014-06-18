<?php

class Contract extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'contract';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'contract_number',
        'account_id',
        'contract_date_start',
        'contract_date_end',
        'user_id'
    );
    
    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'contract_number' => 'required|unique:contract,contract_number',
        'account_id' => 'required',
        'contract_date_start' => 'required',
        'contract_date_end' => 'required',
        'user_id' => 'required'
    );
    
    /**
     * Define a Many To Many Relationship
     * 
     * A Contract has many Products and Products can belong to many Contracts.
     * 
     * @return Model
     */
    public function products()
    {
        return $this->belongsToMany('Product', 'contract_products');
    }
    
    /**
     * Define a One To Many Relationship
     * 
     * The contract can only belong to one account.
     * 
     * @return Model
     */
    public function account()
    {
        return $this->belongsTo('Account');
    }
    
    /**
     * The user who created this contract
     * 
     * @return Model
     */
    public function user()
    {
        return $this->belongsTo('User');
    }

}
