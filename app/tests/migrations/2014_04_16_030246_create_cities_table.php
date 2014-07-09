<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateCitiesTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('cities', function($table)
		{
			$table->engine = 'InnoDB';
			$table->string('city', 50);
            $table->string('state_code', 2);
            $table->integer('zip');
            $table->double('latitude');
            $table->double('longitude');
            $table->string('county', 50);
		});
        
        // DB::update('ALTER TABLE cities CHANGE zip zip INTEGER(5) UNSIGNED ZEROFILL');
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('cities');
	}

}
