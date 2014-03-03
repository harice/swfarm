<?php

use Venturecraft\Revisionable\Revisionable;

class Product extends Revisionable {
  
  use Culpa\CreatedBy;
  use Culpa\DeletedBy;
  use Culpa\UpdatedBy;
  
  protected $blameable = array('created', 'updated', 'deleted');
  protected $softDelete = true;
  
	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'products';

}

Product::observe(new Culpa\BlameableObserver);