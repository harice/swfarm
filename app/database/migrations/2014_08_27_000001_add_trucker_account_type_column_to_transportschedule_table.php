<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTruckerAccountTypeColumnToTransportscheduleTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('transportschedule', function(Blueprint $table)
		{
			$table->integer('truckerAccountType_id')->after('date');
			// $table->foreign('truckerAccountType_id')->references('id')->on('accounttype')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('transportschedule', function(Blueprint $table)
	    {
	    	// $table->dropForeign('truckerAccountType_id');
	      	$table->dropColumn('truckerAccountType_id');
	    });
	}

}