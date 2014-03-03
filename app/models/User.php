<?php

use Illuminate\Auth\UserInterface;
use Illuminate\Auth\Reminders\RemindableInterface;

class User extends Eloquent implements UserInterface, RemindableInterface {
  
  protected $blameable = array('created', 'updated', 'deleted');

	protected $softDelete = true;
	/**
	 * The database table used by the model.
	 *
	 * @var string
	 */
	protected $table = 'users';

	/**
	 * The attributes excluded from the model's JSON form.
	 *
	 * @var array
	 */
	protected $hidden = array('password');

	/**
	 * Get the unique identifier for the user.
	 *
	 * @return mixed
	 */
	public function getAuthIdentifier()
	{
		return $this->getKey();
	}

	/**
	 * Get the password for the user.
	 *
	 * @return string
	 */
	public function getAuthPassword()
	{
		return $this->password;
	}

	/**
	 * Get the e-mail address where password reminders are sent.
	 *
	 * @return string
	 */
	public function getReminderEmail()
	{
		return $this->email;
	}
  
  /**
   * Get the user that created the model
   * @return \Illuminate\Database\Eloquent\Model User instance
   */
  public function createdBy()
  {
    return $this->belongsTo('User');
  }
  
  /**
   * Get the user that created the model
   * @return \Illuminate\Database\Eloquent\Model User instance
   */
  public function updatedBy()
  {
    return $this->belongsTo('User');
  }
  
  /**
   * Get the user that created the model
   * @return \Illuminate\Database\Eloquent\Model User instance
   */
  public function deletedBy()
  {
    return $this->belongsTo('User');
  }

}

User::observe(new Culpa\BlameableObserver);
