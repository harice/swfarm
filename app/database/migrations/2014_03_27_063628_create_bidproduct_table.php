<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateBidproductTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('bidproduct', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->integer('bid_id')->unsigned();
			$table->integer('product_id')->unsigned();
			$table->text('description')->nullable();
			$table->string('stacknumber',20);
			$table->decimal('bidprice', 8, 2);
			$table->decimal('tons', 8, 2);
			$table->integer('bales');
			$table->boolean('ishold');
			$table->decimal('unitprice', 8, 2)->nullable();
			$table->timestamps();

			$table->foreign('bid_id')->references('id')->on('bid')->onDelete('cascade');
			$table->foreign('product_id')->references('id')->on('products');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('bidproduct');
	}

}