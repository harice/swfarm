<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddLonglatToSectionTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('section', function(Blueprint $table)
		{
			$table->string('longitude', 25)->nullable();
			$table->string('latitude', 25)->nullable();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('section', function($table)
		{
		    $table->dropColumn('latitude');
		    $table->dropColumn('longitude');
		});
	}

}
