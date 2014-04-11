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
			$table->decimal('origin_gross', 5, 4);
			$table->decimal('origin_tare', 5, 4);
            $table->decimal('origin_net', 5, 4);
            $table->integer('origin_account_id')->unsigned();
            $table->float('origin_scale_fee');
            
            $table->string('destination_weightinfo_type', 60)->default('Destination');
            $table->integer('destination_bales')->nullable();
			$table->decimal('destination_gross', 5, 4);
			$table->decimal('destination_tare', 5, 4);
            $table->decimal('destination_net', 5, 4);
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
