<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateDocumentsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('documents', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
            $table->string('type', 30);
            $table->integer('size');
            $table->binary('content');
            $table->integer('documentable_id')->nullable();
            $table->string('documentable_type')->nullable();
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
		Schema::dropIfExists('documents');
	}

}