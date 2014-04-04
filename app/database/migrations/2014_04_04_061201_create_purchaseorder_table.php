<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePurchaseorderTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('purchaseorder', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->integer('bid_id')->unsigned();
			$table->timestamp('pickupstart');
			$table->timestamp('pickupend');
			$table->string('status', 10);
			$table->timestamps();
			$table->softDeletes();

			$table->foreign('bid_id')->references('id')->on('bid');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('purchaseorder');
	}

}