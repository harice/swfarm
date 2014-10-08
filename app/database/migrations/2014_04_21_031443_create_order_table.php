<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class CreateOrderTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		Schema::create('order', function(Blueprint $table)
		{
			$table->engine = 'InnoDB';
                  $table->increments('id');
			$table->string('order_number', 20)->unique();
                  $table->integer('location_id')->unsigned()->nullable();
                  $table->integer('natureofsale_id')->unsigned()->nullable();
                  $table->integer('account_id')->unsigned();
                  $table->integer('contact_id')->unsigned();
                  $table->integer('contract_id')->unsigned()->nullable();
                  $table->integer('orderaddress_id')->unsigned();
                  $table->timestamp('transportdatestart')->nullable();
                  $table->timestamp('transportdateend')->nullable();
                  $table->integer('status_id')->unsigned();
                  $table->integer('user_id')->unsigned();
                  $table->text('notes')->nullable();
                  $table->boolean('isfrombid');
                  $table->boolean('verified')->default(false);
                  $table->smallInteger('ordertype');
                  $table->integer('purchaseorder_id')->unsigned()->nullable();
                  $table->decimal('totalPayment', 12, 2)->nullable();
                  $table->timestamps();
                  $table->softDeletes();
                  
                  $table->foreign('location_id')->references('id')->on('location');
                  $table->foreign('natureofsale_id')->references('id')->on('natureofsale');
                  $table->foreign('account_id')->references('id')->on('account');
                  $table->foreign('contact_id')->references('id')->on('contact');
                  $table->foreign('contract_id')->references('id')->on('contract')->onDelete('cascade');
                  $table->foreign('orderaddress_id')->references('id')->on('orderaddress');
                  $table->foreign('status_id')->references('id')->on('status');
                  $table->foreign('user_id')->references('id')->on('users');
                  $table->foreign('purchaseorder_id')->references('id')->on('order')->onDelete('cascade');
		});
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		Schema::dropIfExists('order');
	}

}
