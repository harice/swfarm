<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateContractProductsTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('contract_products', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->integer('contract_id')->unsigned();
            $table->integer('product_id')->unsigned();
            $table->decimal('tons', 8, 4);
			$table->integer('bales');
            
            $table->primary(array('contract_id', 'product_id'));
            
            $table->foreign('contract_id')->references('id')->on('contract')->onDelete('cascade');
            $table->foreign('product_id')->references('id')->on('products')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('contract_products');
	}

}
