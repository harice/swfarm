<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAuditTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('audit',function($table){
			$table->increments('id');
            $table->string('type')->index();
            $table->string('user');
            $table->bigInteger('data_id')->unsigned()->index();
            $table->string('event');
			$table->longText('value');
            $table->timestamps();
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('audit');
	}

}
