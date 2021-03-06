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
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->integer('account')->unsigned();
			$table->string('street');
			$table->string('city');
			$table->integer('state')->unsigned();
			$table->string('zipcode');
			$table->string('longitude', 25)->nullable();
			$table->string('latitude', 25)->nullable();
			$table->string('country');
			$table->integer('type')->unsigned();
			$table->timestamps();
			$table->softDeletes();

			$table->foreign('account')->references('id')->on('account')->onDelete('cascade');
			$table->foreign('type')->references('id')->on('addresstype');
			$table->foreign('state')->references('id')->on('addressstates');			
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