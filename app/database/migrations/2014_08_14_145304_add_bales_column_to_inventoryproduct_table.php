<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddBalesColumnToInventoryproductTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('inventoryproduct', function(Blueprint $table)
		{
			$table->integer('bales')->nullable()->after('price');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('inventoryproduct', function(Blueprint $table)
		{
			//
		});
	}

}