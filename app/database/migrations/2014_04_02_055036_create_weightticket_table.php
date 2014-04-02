<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWeightTicketTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('weightticket', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			// $table->integer('purchaseorder_id')->unsigned();
			// $table->integer('bidproduct_id')->unsigned();
            $table->integer('weighttickettype_id')->unsigned();
			$table->integer('bales');
			$table->float('gross');
			$table->float('tare');
			$table->float('net');
			// $table->integer('scale_id')->unsigned();
            $table->timestamps();

			// $table->foreign('purchaseorder_id')->references('id')->on('purchaseorder');
			// $table->foreign('bidproduct_id')->references('id')->on('bidproduct');
            $table->foreign('weighttickettype_id')->references('id')->on('weighttickettype');
            // $table->foreign('scale_id')->references('id')->on('scale');
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
