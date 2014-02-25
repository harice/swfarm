<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateUserrolesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('userroles',function($table){
			$table->increments('id');
			$table->integer('user')->unsigned();
			$table->integer('role')->unsigned();
			$table->timestamps();

			$table->foreign('user')->references('id')->on('users')->onDelete('cascade');
			$table->foreign('role')->references('id')->on('roles')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('userroles');
	}

}
