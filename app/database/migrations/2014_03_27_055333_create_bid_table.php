<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBidTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('bid', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->string('bidnumber', 20)->unique();
			$table->integer('destination_id')->unsigned();
			$table->integer('producer_id')->unsigned();
			$table->integer('address_id')->unsigned();
			$table->integer('user_id')->unsigned();
			$table->string('status', 10);
			$table->text('notes')->nullable();
			$table->string('ponumber', 20)->unique()->nullable();
			$table->timestamp('po_date')->nullable();
			$table->string('po_status', 10)->nullable();
			$table->timestamps();
			$table->softDeletes();

			$table->foreign('producer_id')->references('id')->on('account');
			$table->foreign('address_id')->references('id')->on('address');
			$table->foreign('user_id')->references('id')->on('users');
			$table->foreign('destination_id')->references('id')->on('destination');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('bid');
	}

}