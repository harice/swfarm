<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTransportscheduleTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('transportschedule', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->integer('bid_id')->unsigned();
			$table->timestamp('date');
			$table->integer('trucker_id')->unsigned();
			$table->decimal('distance', 8, 4);
			$table->float('fuelcharge', 8, 4);
			$table->integer('originloader_id')->unsigned();
			$table->decimal('originloadersfee', 8, 4);
			$table->integer('destinationloader_id')->unsigned();
			$table->decimal('destinationloadersfee', 8, 4);
			$table->decimal('truckingrate', 8, 4);
			$table->tinyInteger('type'); //1 - for pickup, 2 - for delivery
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
		Schema::dropIfExists('transportschedule');
	}

}