<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateStackTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('stack', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->string('stacknumber', 20)->unique();
            $table->integer('product_id')->unsigned();
            $table->integer('farmlocation_id')->unsigned();
            $table->string('notes', 254)->nullable();
			$table->timestamps();
            
            $table->foreign('product_id')->references('id')->on('products');
            $table->foreign('farmlocation_id')->references('id')->on('farmlocation');
            
            // $table->primary(array('stacknumber', 'farmlocation_id'));
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('stack');
	}

}
