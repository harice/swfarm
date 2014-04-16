<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateSalesOrderTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('salesorder', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->string('so_number', 20)->unique();
            $table->integer('origin_id')->unsigned();
            $table->integer('nature_of_sale_id')->unsigned();
            $table->integer('customer_id')->unsigned();
            $table->integer('address_id')->unsigned();
            $table->timestamp('date_of_sale');
            $table->timestamp('delivery_date_start');
            $table->timestamp('delivery_date_end');
            $table->string('status', 10)->default('Open');
            $table->text('notes')->nullable();
            $table->integer('user_id')->unsigned();
            $table->timestamps();
            $table->softDeletes();
            
            $table->foreign('origin_id')->references('id')->on('origin');
            $table->foreign('nature_of_sale_id')->references('id')->on('nature_of_sale');
            $table->foreign('customer_id')->references('id')->on('contact');
            $table->foreign('address_id')->references('id')->on('address');
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
		Schema::dropIfExists('salesorder');
	}

}
