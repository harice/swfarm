<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateNotificationobjectTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('notificationobject', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
			$table->increments('id');
			$table->integer('notification_id')->unsigned()->nullable();
			$table->integer('notificationtype_id')->unsigned();
			$table->timestamps();

			$table->foreign('notification_id')->references('id')->on('notification');
			$table->foreign('notificationtype_id')->references('id')->on('notificationtype');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::drop('notificationObject');
	}

}
