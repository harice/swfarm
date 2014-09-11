<?php

class StorageLocation extends Eloquent {

    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
    protected $table = 'storagelocation';

    /**
     * Define fillable attributes in a model.
     *
     * @var array
     */
    protected $fillable = array(
		'account_id',
        'name',
        'description',
        'address_id',
        'longitude',
        'latitude'
    );

    public static $rules = array(
		'account_id' => 'required',
        'name' => 'required|unique:storagelocation',
        'description' => 'max:250',
        'address_id' => 'required'
    );

    public function account(){
        return $this->hasOne('Account', 'id', 'account_id')->select(array('id', 'name'))->withTrashed();
    }

    public function section(){
        return $this->hasMany('Section', 'storagelocation_id', 'id');
    }

    public function delete(){
        $this->section()->delete();
        return parent::delete();
    }

}
