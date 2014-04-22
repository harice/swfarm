<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateSalesOrderTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('salesorder', function(Blueprint $table)
		{
            $table->foreign('customer_id')->references('id')->on('account');
		});
	}

}
