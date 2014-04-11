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
            $table->string('weightinfo_type', 60);
            $table->integer('bales')->nullable();
			$table->decimal('gross', 8, 2);
			$table->decimal('tare', 8, 2);
            $table->decimal('net', 8, 2);
            $table->string('scale');
            $table->decimal('scale_fee', 8, 2);
            $table->integer('weightticket_id')->unsigned();
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
