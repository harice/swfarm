<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddColumnToProductOrderSummaryTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('productordersummary', function(Blueprint $table)
		{
			$table->integer('order_id')->unsigned()->after('product_id');

			$table->foreign('order_id')->references('id')->on('order_id');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::table('productordersummary', function(Blueprint $table)
		{
			$table->dropForeign('productordersummary_order_id_foreign');
            $table->dropColumn('order_id');
		});
		
	}

}