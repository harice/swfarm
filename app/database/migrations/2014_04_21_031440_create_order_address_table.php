<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrderAddressTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('orderaddress', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
            $table->string('street');
			$table->integer('city')->unsigned();
			$table->integer('state')->unsigned();
            $table->string('zipcode', 60);

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
		Schema::dropIfExists('orderaddress');
	}

}
