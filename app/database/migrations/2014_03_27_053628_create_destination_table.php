<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDestinationTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('destination', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->string('destination',100);

		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('destination', function(Blueprint $table)
		{
			Schema::dropIfExists('destination');
		});
	}

}