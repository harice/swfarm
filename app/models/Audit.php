<?php

class Audit extends Eloquent {
  protected $fillable = ['type', 'user', 'data_id', 'event', 'value'];
    
  /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'audit';
  
}