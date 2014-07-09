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
        'description'
    );
    
    public static $rules = array(
		'account_id' => 'required',
        'name' => 'required',
        'description' => 'max:250'
    );

    public function account(){
        return $this->hasOne('Account', 'id', 'account_id')->select(array('id', 'name'))->withTrashed();
    }

    public function section(){
        return $this->hasMany('section', 'storagelocation_id', 'id');
    }

    public function delete(){
        $this->section()->delete();
        return parent::delete();
    }

}
