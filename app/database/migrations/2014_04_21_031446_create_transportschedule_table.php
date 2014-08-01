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
			$table->integer('order_id')->unsigned();
			$table->timestamp('date');
			$table->integer('trucker_id')->unsigned();
            $table->integer('truck_id')->unsigned();
			$table->integer('trailer_id')->unsigned()->nullable();
			$table->decimal('distance', 8, 2);
			$table->decimal('fuelcharge', 8, 2);
			$table->integer('originloader_id')->unsigned();
			$table->decimal('originloaderfee', 8, 2);
			$table->integer('destinationloader_id')->unsigned();
			$table->decimal('destinationloaderfee', 8, 2);
			$table->decimal('truckingrate', 8, 2)->nullable();
			$table->decimal('trailerrate', 8, 2)->nullable();
			$table->tinyInteger('type')->index(); //1 - for pickup, 2 - for delivery
            $table->integer('status_id')->unsigned();
			$table->timestamps();

			$table->foreign('order_id')->references('id')->on('order');
			$table->foreign('trucker_id')->references('id')->on('contact');
            $table->foreign('truck_id')->references('id')->on('truck');
			$table->foreign('trailer_id')->references('id')->on('trailer');
			$table->foreign('originloader_id')->references('id')->on('contact');
			$table->foreign('destinationloader_id')->references('id')->on('contact');
            $table->foreign('status_id')->references('id')->on('status');
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