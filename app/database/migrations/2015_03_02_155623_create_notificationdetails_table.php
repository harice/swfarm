<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateNotificationdetailsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('notificationdetails', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->integer('notificationobject_id')->unsigned()->nullable();
			$table->string('details',250); //module
			$table->integer('actor')->unsigned()->nullable();
			$table->timestamps();

			$table->foreign('notificationobject_id')->references('id')->on('notificationobject');
			$table->foreign('actor')->references('id')->on('users');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('notificationdetails');
	}

}
