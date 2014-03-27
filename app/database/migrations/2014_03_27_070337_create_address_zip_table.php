<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateAddressZipTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('addresszip', function($table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->integer('zip', false);
            $table->integer('city')->unsigned();
            
            $table->foreign('city')->references('id')->on('addresscities');
		});
        
        DB::update('ALTER TABLE addresszip CHANGE zip zip INTEGER(5) UNSIGNED ZEROFILL');
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('addresszip');
	}

}
