<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAddressCitiesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('address_cities', function($table)
		{
            $table->increments('id');
			$table->string('city', 50);
            $table->integer('state')->unsigned();
            
            $table->foreign('state')->references('id')->on('address_states');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('address_cities');
	}

}
