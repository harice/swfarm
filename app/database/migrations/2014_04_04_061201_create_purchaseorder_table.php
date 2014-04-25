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
			$table->string('ponumber', 20)->unique()->nullable();
			$table->timestamp('date')->nullable();
			$table->string('status', 10)->nullable();
			$table->timestamp('pickupstart')->nullable();
			$table->timestamp('pickupend')->nullable();
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