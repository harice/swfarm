<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateWeightinfoTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('weightinfo', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
            $table->integer('bales')->nullable();
			$table->float('gross');
			$table->float('tare');
            $table->float('net');
            $table->string('scale');
            $table->float('scale_fee');
            $table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('weightinfo');
	}

}
