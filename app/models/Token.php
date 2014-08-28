<?php

class Token extends Eloquent {
	public $timestamps = false;

	protected $fillable = array('id', 'ip_address', 'user_agent');
}