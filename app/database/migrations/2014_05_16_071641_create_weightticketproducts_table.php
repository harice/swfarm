<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWeightticketproductsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('weightticketproducts', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->integer('weightTicketScale_id')->unsigned();
			$table->integer('transportScheduleProduct_id')->unsigned();
			$table->decimal('bales', 8, 2);
			$table->decimal('pounds', 8, 2);
			$table->timestamps();
            
            $table->foreign('weightTicketScale_id')->references('id')->on('weightticketscale');
            $table->foreign('transportScheduleProduct_id')->references('id')->on('transportscheduleproduct')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('weightticketproducts');
	}

}