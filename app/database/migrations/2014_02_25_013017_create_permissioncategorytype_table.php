<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreatePermissioncategorytypeTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('permissioncategorytype',function($table){
			$table->increments('id');
			$table->integer('permissioncategory')->unsigned();
			$table->integer('permissiontype')->unsigned();
			$table->foreign('permissioncategory')->references('id')->on('permissioncategory')->onDelete('cascade');
			$table->foreign('permissiontype')->references('id')->on('permissiontype')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('permissioncategorytype');
	}

}
