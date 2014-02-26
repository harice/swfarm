<?php

class Roles extends Eloquent {
	protected $guarded = array();

	public static $rules = array('name' => 'required');
}
