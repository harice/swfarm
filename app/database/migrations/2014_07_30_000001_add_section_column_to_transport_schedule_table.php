<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSectionColumnToTransportScheduleTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('transportschedule', function(Blueprint $table)
		{
			$table->integer('sectionto_id')->unsigned()->nullable()->after('status_id');

			$table->foreign('sectionto_id')->references('id')->on('section');
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
			$table->dropForeign('transportschedule_sectionto_id_foreign');
            $table->dropColumn('sectionto_id');
		});
		
	}

}