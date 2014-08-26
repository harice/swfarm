<?php

class Files extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'file';

	public static $rules = array(
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
        'type', 
        'size', 
        'content'
    );

    protected $visible = array(
        'id',
        'type', 
        'size'
    );

}
