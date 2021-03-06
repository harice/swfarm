<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUsersTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('users',function($table){
			$table->increments('id');
			$table->string('email')->unique();
			$table->string('password');
			$table->string('firstname',50);
			$table->string('lastname',50);
			$table->string('suffix',6)->nullable();
			$table->string('emp_no')->unique();
			$table->string('mobile',20)->nullable();
			$table->string('phone',20)->nullable();
			$table->string('position',50)->nullable();
			$table->string('profileimg',50)->nullable();
			$table->string('confirmcode');
			$table->string('remember_token')->nullable();
			$table->boolean('validated')->default(false)->index();
			$table->boolean('status')->default(true)->index();
			$table->boolean('deleted')->default(false)->index();
			$table->timestamps();
			$table->softDeletes();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('users');
	}

}
