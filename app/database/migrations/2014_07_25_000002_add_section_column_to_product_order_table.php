<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddSectionColumnToProductOrderTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('productorder', function(Blueprint $table)
		{
			$table->integer('section_id')->unsigned()->nullable()->after('rfv');

			$table->foreign('section_id')->references('id')->on('section')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('productorder', function(Blueprint $table)
		{
			$table->dropForeign('productorder_section_id_foreign');
            $table->dropColumn('section_id');
		});
		
	}

}