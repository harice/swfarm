<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateProductOrderTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('productorder', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
            $table->integer('order_id')->unsigned();
			$table->integer('product_id')->unsigned();
			$table->text('description')->nullable();
			$table->string('stacknumber', 20);
			$table->decimal('tons', 8, 4);
			$table->integer('bales');
			$table->decimal('unitprice', 8, 2)->nullable();
			$table->boolean('ishold');
            $table->string('rfv', 3)->after('bales');
            $table->integer('stack_id')->unsigned()->nullable();
			$table->timestamps();

			$table->foreign('product_id')->references('id')->on('products');
            $table->foreign('order_id')->references('id')->on('order');
            $table->foreign('stack_id')->references('id')->on('stack');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('productorder');
	}

}
