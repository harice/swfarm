<?php

use Illuminate\Database\Schema\Blueprint;
use Illuminate\Database\Migrations\Migration;

class AlterTonsColumnInRelatedTables extends Migration {

	/**
	 * Run the migrations.
	 *
	 * @return void
	 */
	public function up()
	{
		DB::update('ALTER TABLE `productordersummary` MODIFY `tons` DECIMAL(8,2)');

		DB::update('ALTER TABLE `productorder` MODIFY `tons` DECIMAL(8,2)');

		DB::update('ALTER TABLE `inventoryproduct` MODIFY `tons` DECIMAL(8,2)');

		DB::update('ALTER TABLE `stacklocation` MODIFY `tons` DECIMAL(8,2)');

		DB::update('ALTER TABLE `transportscheduleproduct` MODIFY `quantity` DECIMAL(8,2)');

		DB::update('ALTER TABLE `contract_products` MODIFY `tons` DECIMAL(8,2)');
	}

	/**
	 * Reverse the migrations.
	 *
	 * @return void
	 */
	public function down()
	{
		DB::update('ALTER TABLE `productordersummary` MODIFY `tons` DECIMAL(8,4)');

		DB::update('ALTER TABLE `productorder` MODIFY `tons` DECIMAL(8,4)');

		DB::update('ALTER TABLE `inventoryproduct` MODIFY `tons` DECIMAL(8,4)');

		DB::update('ALTER TABLE `stacklocation` MODIFY `tons` DECIMAL(8,4)');

		DB::update('ALTER TABLE `transportscheduleproduct` MODIFY `quantity` DECIMAL(8,4)');

		DB::update('ALTER TABLE `contract_products` MODIFY `tons` DECIMAL(8,4)');
	}

}
