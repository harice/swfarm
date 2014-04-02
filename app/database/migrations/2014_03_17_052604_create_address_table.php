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
			$table->integer('city')->unsigned();
			$table->integer('state')->unsigned();
			$table->string('zipcode');
			$table->string('country');
			$table->integer('type')->unsigned();
			$table->timestamps();
			$table->softDeletes();

		});

		Schema::table('address', function($table)
		{
			$table->engine = 'InnoDB';
			$table->foreign('account')->references('id')->on('account')->onDelete('cascade');
			$table->foreign('type')->references('id')->on('addresstype');
			
			$table->foreign('state')->references('id')->on('addressstates');
			$table->foreign('city')->references('id')->on('addresscities');
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