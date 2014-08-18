<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddLonglatColumnToStoragelocationTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('storagelocation', function(Blueprint $table)
		{
			$table->string('longitude', 25)->nullable()->after('description');	
			$table->string('latitude', 25)->nullable()->after('longitude');	
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('storagelocation', function(Blueprint $table)
		{
			
		});
	}

}