<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFileTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('file', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
            $table->string('name', 50);
            $table->string('type', 30);
            $table->integer('size');
            $table->binary('content');
            $table->boolean('issave')->default(0);
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
		Schema::dropIfExists('file');
	}

}