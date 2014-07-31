<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddCheckoutColumnToWeightTicketTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('weightticket', function(Blueprint $table)
		{
			$table->integer('checkout')->nullable()->after('status_id');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('weightticket', function(Blueprint $table)
		{
            $table->dropColumn('checkout');
		});
		
	}

}