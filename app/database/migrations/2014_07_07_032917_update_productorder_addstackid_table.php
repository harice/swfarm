<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateProductorderAddStackIdTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('productorder', function(Blueprint $table)
		{
			$table->integer('stack_id')->unsigned()->nullable()->after('stacknumber');
			$table->foreign('stack_id')->references('id')->on('stack');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		
	}

}
