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
            $table->string('wtn', 20)->unique();
            $table->integer('purchaseorder_id')->unsigned();
            $table->integer('pickupschedule_id')->unsigned();
            $table->integer('bidproduct_id')->unsigned();
            
            $table->string('origin_weightinfo_type', 60)->default('Origin');
            $table->integer('origin_bales')->nullable();
			$table->float('origin_gross');
			$table->float('origin_tare');
            $table->float('origin_net');
            $table->integer('origin_account_id')->unsigned();
            $table->float('origin_scale_fee');
            
            $table->string('destination_weightinfo_type', 60)->default('Destination');
            $table->integer('destination_bales')->nullable();
			$table->float('destination_gross');
			$table->float('destination_tare');
            $table->float('destination_net');
            $table->integer('destination_account_id')->unsigned();
            $table->float('destination_scale_fee');
            
			$table->timestamps();
            
            $table->foreign('purchaseorder_id')->references('id')->on('bid');
            $table->foreign('pickupschedule_id')->references('id')->on('pickupschedule');
            $table->foreign('bidproduct_id')->references('id')->on('bidproduct');
            $table->foreign('origin_account_id')->references('id')->on('account');
            $table->foreign('destination_account_id')->references('id')->on('account');
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
