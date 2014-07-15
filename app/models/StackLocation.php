<?php

class StackLocation extends Eloquent {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
    protected $table = 'stacklocation';
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array(
		'stack_id',
        'section_id',
        'tons'
    );
    
    public static $rules = array(
		'stack_id' => 'required',
        'section_id' => 'required',
        'tons' => 'required'
    );

    public function stack(){
        return $this->belongsTo('Stack', 'id', 'stack_id');
    }

    public function section(){
        return $this->hasMany('section', 'id', 'section_id');
    }


}
