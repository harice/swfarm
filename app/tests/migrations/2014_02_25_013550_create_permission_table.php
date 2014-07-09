<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePermissionTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('permission',function($table){
			$table->increments('id');
			$table->integer('role')->unsigned();
			$table->integer('permissioncategorytype')->unsigned();
			$table->boolean('access')->default(false);

			$table->foreign('role')->references('id')->on('roles')->onDelete('cascade');
			$table->foreign('permissioncategorytype')->references('id')->on('permissioncategorytype')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('permission');
	}

}
