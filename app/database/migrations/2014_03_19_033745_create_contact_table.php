<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateContactTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('contact', function($table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->string('firstname',50);
			$table->string('lastname',50);
            $table->string('suffix',6)->nullable();
			$table->string('position',50)->nullable();
			$table->string('email')->unique();
			$table->string('phone',20)->nullable();
			$table->string('mobile',20)->nullable();
			$table->integer('account')->unsigned()->nullable();
            $table->decimal('rate', 8, 2)->nullable();
			$table->timestamps();
			$table->softDeletes();

			$table->foreign('account')->references('id')->on('account')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('contact');
	}

}