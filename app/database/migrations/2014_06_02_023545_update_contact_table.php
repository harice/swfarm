<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class UpdateContactTable extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		$this->update_1();
	}
    
    /**
     * Update 1
     * 
     * @return void
     */
    public function update_1 ()
    {
        Schema::table('contact', function(Blueprint $table)
		{
            $table->decimal('rate', 8, 2)->nullable();
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
