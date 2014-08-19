<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAccountAccountType extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('account_accounttype', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('account_id')->unsigned();
			$table->integer('accounttype_id')->unsigned();
			$table->timestamps();
			
			$table->foreign('account_id')->references('id')->on('account')->onDelete('cascade');
			$table->foreign('accounttype_id')->references('id')->on('accounttype')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('accountpivottypes');
	}

}
