<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddTruckToTransportscheduleTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('transportschedule', function(Blueprint $table)
		{
			$table->integer('truck_id')->unsigned()->after('trucker_id');

			$table->foreign('truck_id')->references('id')->on('truck');
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
			$table->dropForeign('transportschedule_truck_id_foreign');
            $table->dropColumn('truck_id');
		});
		
	}

}