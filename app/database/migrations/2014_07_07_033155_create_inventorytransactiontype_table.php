<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInventorytransactiontypeTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('inventorytransactiontype', function(Blueprint $table)
		{
			$table->increments('id');
			$table->string('type', 20);
			$table->string('operation', 10); //add/subtract/equal
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('inventorytransactiontype');
	}

}
