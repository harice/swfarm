<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSectionColumnToTransportScheduleProductTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('transportscheduleproduct', function(Blueprint $table)
		{
			$table->integer('sectionto_id')->unsigned()->nullable()->after('quantity');

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
		Schema::table('transportscheduleproduct', function(Blueprint $table)
		{
			$table->dropForeign('transportscheduleproduct_sectionto_id_foreign');
            $table->dropColumn('sectionto_id');
		});
		
	}

}