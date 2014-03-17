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
		Schema::create('addresscities', function($table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->string('city', 50);
            $table->integer('state')->unsigned();
            
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
		Schema::dropIfExists('addresscities');
	}

}
