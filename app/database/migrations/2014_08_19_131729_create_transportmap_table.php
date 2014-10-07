<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTransportmapTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('transportmap', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('transportschedule_id')->unsigned();
			$table->integer('sequenceNo');
			$table->string('longitudeFrom', 25);	
			$table->string('latitudeFrom', 25);	
			$table->string('longitudeTo', 25);	
			$table->string('latitudeTo', 25);
			$table->decimal('distance', 10, 2);
			$table->boolean('isLoadedDistance');
			$table->timestamps();

			$table->foreign('transportschedule_id')->references('id')->on('transportschedule')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('transportmap');
	}

}
