<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrderTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('order', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->string('order_number', 20)->unique();
            $table->integer('origin_id')->unsigned();
            $table->integer('natureofsale_id')->unsigned();
            $table->integer('account_id')->unsigned();
            $table->integer('orderaddress_id')->unsigned();
            $table->timestamp('dateofsale');
            $table->timestamp('transportdatestart');
            $table->timestamp('transportdateend');
            $table->integer('status_id')->unsigned();
            $table->integer('user_id')->unsigned();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('origin_id')->references('id')->on('origin');
            $table->foreign('natureofsale_id')->references('id')->on('natureofsale');
            $table->foreign('account_id')->references('id')->on('account');
            $table->foreign('orderaddress_id')->references('id')->on('orderaddress');
            $table->foreign('status_id')->references('id')->on('status');
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
		Schema::dropIfExists('order');
	}

}
