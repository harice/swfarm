<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateContractTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('contract', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
            $table->increments('id');
			$table->string('contract_number', 20)->unique();
            $table->integer('account_id')->unsigned();
            $table->timestamp('contract_date_start');
            $table->timestamp('contract_date_end');
            $table->integer('status_id')->unsigned()->default(1);
            $table->integer('user_id')->unsigned();
            $table->timestamps();
            
            $table->foreign('account_id')->references('id')->on('account')->onDelete('cascade');
            $table->foreign('status_id')->references('id')->on('status')->onDelete('cascade');
            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('contract');
	}

}
