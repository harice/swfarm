<?php

class File extends BaseModel 
{
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

    public function fileable()
    {
        return $this->morphTo();
    }

}
