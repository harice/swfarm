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
			$table->string('username')->unique();
			$table->string('password');
			$table->string('email')->unique();
			$table->string('firstname',50);
			$table->string('lastname',50);
			$table->string('suffix',6)->nullable();
			$table->string('emp_no')->unique();
			$table->string('mobile',13)->nullable();
			$table->string('phone',13)->nullable();
			$table->string('position',50)->nullable();
			$table->boolean('validated')->default(false)->index();
			$table->boolean('status')->default(true)->index();
			$table->boolean('deleted')->default(false)->index();
			$table->timestamps();
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
