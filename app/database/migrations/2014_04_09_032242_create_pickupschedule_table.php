<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePickupscheduleTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('pickupschedule', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->integer('bid_id')->unsigned();
			$table->timestamp('pickupdate');
			$table->integer('trucker_id')->unsigned();
			$table->float('distance');
			$table->float('fuelcharge');
			$table->integer('originloader_id')->unsigned();
			$table->float('originloadersfee');
			$table->integer('destinationloader_id')->unsigned();
			$table->float('destinationloadersfee');
			$table->timestamps();

			$table->foreign('bid_id')->references('id')->on('bid');
			$table->foreign('trucker_id')->references('id')->on('account');
			$table->foreign('originloader_id')->references('id')->on('account');
			$table->foreign('destinationloader_id')->references('id')->on('account');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('pickupschedule');
	}

}