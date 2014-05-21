<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWeightticketTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('weightticket', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->integer('transportSchedule_id')->unsigned();
            $table->string('weightTicketNumber', 20)->unique();
            $table->string('loadingTicketNumber', 20)->unique();
            $table->integer('pickup_id')->unsigned();
            $table->integer('dropoff_id')->unsigned();
            $table->integer('status_id')->unsigned();
			$table->timestamps();
            
            $table->foreign('transportSchedule_id')->references('id')->on('transportschedule');
            $table->foreign('pickup_id')->references('id')->on('weightticketscale');
            $table->foreign('dropoff_id')->references('id')->on('weightticketscale');
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
		Schema::dropIfExists('weightticket');
	}

}