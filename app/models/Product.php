<?php

use Venturecraft\Revisionable\Revisionable;

class Product extends Revisionable {
  
  protected $softDelete = true;
  
	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'products';

}