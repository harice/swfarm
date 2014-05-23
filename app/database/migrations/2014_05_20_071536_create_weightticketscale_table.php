<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWeightticketscaleTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('weightticketscale', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			//$table->integer('weightTicket_id')->unsigned();
			$table->integer('scaleAccount_id')->unsigned();
			$table->integer('scale_id')->unsigned();
			$table->decimal('fee', 8, 2);
			$table->decimal('bales', 8, 2);
			$table->decimal('gross', 8, 4);
			$table->decimal('tare', 8, 4);
			$table->smallInteger('type'); //1 for pickup, 2 for dropoff
			$table->timestamps();
            
            //$table->foreign('weightTicket_id')->references('id')->on('weightticket');
            $table->foreign('scaleAccount_id')->references('id')->on('account');
			$table->foreign('scale_id')->references('id')->on('scale');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('weightticketscale');
	}

}