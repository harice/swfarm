<?php

/**
 * Description of Section
 *
 * @author Avs
 */
class Section extends BaseModel {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'section';

    public $timestamps = false;
    
    /**
     * Define fillable attributes in a model.
     * 
     * @var array
     */
    protected $fillable = array('storagelocation_id', 'name', 'description');

    /**
     * Define field validation rules.
     * 
     * @var array
     */
	public static $rules = array(
        'storagelocation_id' => 'required',
        'name' => 'required',
        'description' => 'max:250'
    );
    
    public function storagelocation()
    {
        return $this->belongsTo('StorageLocation', 'storagelocation_id', 'id');
    }

    public function storagelocationName()
    {
        return $this->belongsTo('StorageLocation', 'storagelocation_id', 'id')->select(array('id', 'name'))->withTrashed();
    }

    public function stacklocation(){
        return $this->belongsTo('StackLocation', 'id', 'section_id');
    }
    
}
