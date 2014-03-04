<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterProductsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::table('products',function($table){
      $table->integer('created_by_id')->unsigned();
      $table->integer('updated_by_id')->unsigned();
      $table->integer('deleted_by_id')->unsigned()->nullable();
//      $table->foreign('created_by_id')->references('id')->on('users');
//      $table->foreign('updated_by_id')->references('id')->on('users');
//      $table->foreign('deleted_by_id')->references('id')->on('users');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		//
	}

}
