<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCommissionTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('commission', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('order_id')->unsigned();
			$table->integer('weightticket_id')->unsigned();
			$table->integer('user_id')->unsigned();
			$table->decimal('tons', 10, 4);
			$table->decimal('rate', 10, 2)->nullable();
			$table->decimal('amountdue', 10, 2);
			$table->tinyInteger('type'); //1 flat rate / 2 per ton rate

			$table->timestamps();

			$table->foreign('order_id')->references('id')->on('order');
			$table->foreign('weightticket_id')->references('id')->on('weightticket');
			$table->foreign('user_id')->references('id')->on('users');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('commission');
	}

}
