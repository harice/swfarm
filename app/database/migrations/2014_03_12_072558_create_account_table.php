<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAccountTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('account', function($table)
		{
			$table->increments('id');
			$table->string('name')->unique();
			$table->string('website')->nullable();
			$table->string('description')->nullable();
			$table->string('phone')->nullable();
			$table->integer('accounttype')->unsigned();
			$table->timestamps();
			$table->softDeletes();

			$table->foreign('accounttype')->references('id')->on('accounttype');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('account');
	}

}