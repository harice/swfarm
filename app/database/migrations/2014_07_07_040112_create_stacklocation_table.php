<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStacklocationTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('stacklocation', function(Blueprint $table)
		{
			$table->increments('id');
			$table->integer('stack_id')->unsigned();
			$table->integer('section_id')->unsigned();
			$table->decimal('tons', 8, 4);
			$table->timestamps();

			$table->foreign('stack_id')->references('id')->on('stack');
			$table->foreign('section_id')->references('id')->on('section');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('stacklocation');
	}

}
