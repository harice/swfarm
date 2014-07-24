<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddColumnToProductOrderTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('productorder', function(Blueprint $table)
		{
			$table->integer('productordersummary_id')->unsigned()->after('product_id');

			$table->foreign('productordersummary_id')->references('id')->on('productordersummary')->onDelete('cascade');
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
			$table->dropForeign('productorder_productordersummary_id_foreign');
            $table->dropColumn('productordersummary_id');
		});
		
	}

}