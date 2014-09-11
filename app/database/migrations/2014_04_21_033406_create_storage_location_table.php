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
			$table->string('longitude', 25)->nullable();
			$table->string('latitude', 25)->nullable();
            $table->integer('address_id')->unsigned();
			$table->timestamps();

			$table->foreign('account_id')->references('id')->on('account');
            $table->foreign('address_id')->references('id')->on('address');
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
