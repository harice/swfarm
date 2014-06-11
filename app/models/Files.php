<?php

class Files extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'file';

	public static $rules = array(
        'name' => 'required',
        'type' => 'required',
        'size' => 'required',
        'content' => 'required'
    );

    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
        'name', 
        'type', 
        'size', 
        'content'
    );

    protected $visible = array(
        'id',
        'name', 
        'type', 
        'size'
    );
    
    /**
     * Define the relationship with the weightinfo table
     * @return Collection collection of WeightInfo Models
     */
    public function upload()
    {
        return $this->belongsTo('Upload', 'id', 'file_id');
    }

}
