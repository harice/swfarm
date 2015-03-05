<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddColumnsToNotificationobjectTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('notificationobject', function(Blueprint $table)
		{
			$table->string('details')->nullable()->after('notificationtype_id');
			$table->integer('actor')->unsigned()->after('details');

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
		Schema::table('notificationobject', function(Blueprint $table)
		{
			$table->dropColumn('actor');
			$table->dropColumn('details');
		});
	}

}
