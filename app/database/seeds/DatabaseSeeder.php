<?php

class DatabaseSeeder extends Seeder {

	/**
	 * Run the database seeds.
	 *
	 * @return void
	 */
	public function run()
	{
		Eloquent::unguard();
		
		$this->call('UsersTableSeeder');
		$this->call('PermissioncategoryTableSeeder');
		$this->call('PermissiontypeTableSeeder');
		$this->call('PermissioncategorytypeTableSeeder');
		$this->call('AccountTypeTableSeeder');
		$this->call('AddressTypeTableSeeder');
        
        $this->call('AddressStatesTableSeeder');
        $this->call('AddressCitiesTableSeeder');
        $this->call('AddressZipTableSeeder');

        $this->call('DestinationTableSeeder');
        
        // Testing
        $this->call('ProductsTableSeeder');
        $this->call('AccountTableSeeder');
        $this->call('AddressTableSeeder');
        $this->call('BidTableSeeder');
        $this->call('BidProductTableSeeder');
        $this->call('PurchaseOrderTableSeeder');
        $this->call('PickupScheduleTableSeeder');
        $this->call('WeightTicketTableSeeder');

	}

}