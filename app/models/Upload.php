<?php

class Upload extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'upload';

	public static $rules = array(
        'file_id' => 'required',
        'entityname' => 'required',
        'entity_id' => 'required'
    );

    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'file_id', 
        'entityname', 
        'entity_id'
    );
    
    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function files()
    {
        return $this->hasMany('Files', 'id', 'file_id');
    }

    public function productorder()
    {
        return $this->belongsTo('ProductOrder','entity_id', 'id');
    }

    public function delete(){
        $this->files()->delete();
        return parent::delete();
    }
}
