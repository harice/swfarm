<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrdercancellingreasonTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('ordercancellingreason', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
            $table->integer('order')->unsigned();
            $table->integer('reason')->unsigned();
            $table->text('others')->nullable();

            $table->foreign('order')->references('id')->on('order');
            $table->foreign('reason')->references('id')->on('reason');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('ordercancellingreason');
	}

}