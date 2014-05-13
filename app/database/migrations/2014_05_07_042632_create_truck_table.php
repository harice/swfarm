<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateTruckTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('truck', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->integer('account_id')->unsigned();
            $table->string('name', 20);
            $table->decimal('rate', 8, 2);
			$table->timestamps();
            
            $table->foreign('account_id')->references('id')->on('account');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('truck');
	}

}
