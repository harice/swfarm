<?php

class Roles extends Eloquent {
	
  use Culpa\CreatedBy;
  use Culpa\DeletedBy;
  use Culpa\UpdatedBy;
  
  protected $blameable = array('created', 'updated', 'deleted');
  
  protected $guarded = array();

	public static $rules = array('name' => 'required');
}

Roles::observe(new Culpa\BlameableObserver);