<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AddExtraColumnToNotificationobjectTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('notificationobject', function(Blueprint $table)
		{
			$table->string('extra')->nullable()->after('actor');
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
			$table->dropColumn('extra');
		});
	}

}
