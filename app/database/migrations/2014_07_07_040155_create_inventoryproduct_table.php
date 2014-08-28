<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInventoryproductTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('inventoryproduct', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('inventory_id')->unsigned();
			$table->integer('stack_id')->unsigned();
			$table->decimal('price', 10, 2);
			$table->integer('bales')->nullable();
			$table->decimal('tons', 8, 4);
            $table->integer('sectionfrom_id')->unsigned()->nullable();
            $table->integer('sectionto_id')->unsigned()->nullable();
			
			$table->timestamps();

			$table->foreign('inventory_id')->references('id')->on('inventory');
			$table->foreign('stack_id')->references('id')->on('stack');
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
		Schema::drop('inventoryproduct');
	}

}
