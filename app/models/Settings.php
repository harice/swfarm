<?php

class Settings extends BaseModel {
    
    /**
     * The database table used by the model.
     *
     * @var string
     */
    protected $table = 'settings';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('name', 'value');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
    public static $rules = array(
        'name' => 'required',
        'value' => 'required'
    );
   
}
