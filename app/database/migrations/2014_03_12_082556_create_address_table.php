<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAddressTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('address', function($table)
		{
			$table->increments('id');
			$table->integer('account')->unsigned();
			$table->string('street');
			$table->string('city');
			$table->string('state');
			$table->string('country');
			$table->integer('type')->unsigned();
			$table->timestamps();

			$table->foreign('account')->references('id')->on('account');
			$table->foreign('type')->references('id')->on('addresstype');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('address');
	}

}