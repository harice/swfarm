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
		Schema::create('weightticket', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
            $table->integer('purchaseorder_id');
            $table->integer('pickupschedule_id');
            $table->integer('bidproduct_id');
            
            $table->string('origin_weightinfo_type', 60)->default('Origin');
            $table->integer('origin_bales')->nullable();
			$table->float('origin_gross');
			$table->float('origin_tare');
            $table->float('origin_net');
            $table->string('origin_scale');
            $table->float('origin_scale_fee');
            
            $table->string('destination_weightinfo_type', 60)->default('Destination');
            $table->integer('destination_bales')->nullable();
			$table->float('destination_gross');
			$table->float('destination_tare');
            $table->float('destination_net');
            $table->string('destination_scale');
            $table->float('destination_scale_fee');
            
			$table->timestamps();
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
