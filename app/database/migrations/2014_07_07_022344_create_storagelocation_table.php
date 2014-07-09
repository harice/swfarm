<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStorageLocationTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('storagelocation', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('account_id')->unsigned();
			$table->string('name');
			$table->text('description');
			$table->timestamps();

			$table->foreign('account_id')->references('id')->on('account');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('storagelocation');
	}

}
