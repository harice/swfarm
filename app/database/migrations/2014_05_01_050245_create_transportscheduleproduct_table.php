<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTransportscheduleproductTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('transportscheduleproduct', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
            $table->integer('transportschedule_id')->unsigned();
            $table->integer('productorder_id')->unsigned();
			$table->decimal('quantity', 8, 2);

			$table->foreign('transportschedule_id')->references('id')->on('transportschedule');
            $table->foreign('productorder_id')->references('id')->on('productorder');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('transportscheduleproduct');
	}

}