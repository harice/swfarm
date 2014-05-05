<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateFeeTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('fee', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->integer('account_id')->unsigned();
            $table->string('type', 20);
            $table->decimal('fee', 8, 2);
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
		Schema::dropIfExists('fee');
	}

}
