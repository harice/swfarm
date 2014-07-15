<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddColumnsToInventoryProductTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('inventoryproduct', function(Blueprint $table)
		{
			$table->integer('sectionfrom_id')->unsigned()->nullable()->after('stack_id');
			$table->integer('sectionto_id')->unsigned()->nullable()->after('sectionfrom_id');

			$table->foreign('sectionfrom_id')->references('id')->on('section');
			$table->foreign('sectionto_id')->references('id')->on('section');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		
	}

}