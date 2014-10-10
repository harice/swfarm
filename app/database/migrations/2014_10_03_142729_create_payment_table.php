<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePaymentTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('payment', function(Blueprint $table)
		{
			$table->increments('id');
			$table->string('transactionnumber', 20)->unique();
			$table->integer('order_id')->unsigned();
			$table->integer('account_id')->unsigned();
			$table->string('checknumber', 30)->nullable();
			$table->decimal('amount', 12, 2);
			$table->text('notes')->nullable();
			$table->boolean('isCancel')->default(false);
			$table->timestamps();

			$table->foreign('order_id')->references('id')->on('order');
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
		Schema::dropIfExists('payment');
	}

}
