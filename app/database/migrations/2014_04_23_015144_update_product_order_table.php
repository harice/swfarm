<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateProductOrderTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('productorder', function($table)
		{
            $table->string('entity', 60);
			$table->integer('entity_id')->unsigned();
            $table->dropForeign('productorder_salesorder_id_foreign');
            $table->dropColumn('salesorder_id');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		// Schema::dropIfExists('productorder');
	}

}
