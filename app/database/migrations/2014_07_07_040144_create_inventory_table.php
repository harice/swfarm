<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateInventoryTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('inventory', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('transactiontype_id')->unsigned();
			$table->integer('stacklocation_id')->unsigned();
			$table->integer('weightticket_id')->unsigned()->nullable();
			$table->integer('order_id')->unsigned()->nullable();
			$table->timestamps();

			$table->foreign('transactiontype_id')->references('id')->on('inventorytransactiontype');
			$table->foreign('stacklocation_id')->references('id')->on('stacklocation');
			$table->foreign('weightticket_id')->references('id')->on('weightticket');
			$table->foreign('order_id')->references('id')->on('order');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('inventory');
	}

}
