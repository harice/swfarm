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
                $this->call('SettingsTableSeeder');
		$this->call('PermissioncategoryTableSeeder');
		$this->call('PermissiontypeTableSeeder');
		$this->call('PermissioncategorytypeTableSeeder');
		$this->call('AccountTypeTableSeeder');
		$this->call('AddressTypeTableSeeder');
        
                $this->call('AddressStatesTableSeeder');

		// Sales Order
        $this->call('LocationTableSeeder');
        $this->call('NatureOfSaleTableSeeder');
        $this->call('StatusTableSeeder');
        
        // Testing
		// $this->call('ProductsTableSeeder');
        // $this->call('AccountTableSeeder');
        // $this->call('ContactTableSeeder');
        // $this->call('AddressTableSeeder');
		// $this->call('BidTableSeeder');
        // $this->call('BidProductTableSeeder');
        // $this->call('PurchaseOrderTableSeeder');
        // $this->call('TransportScheduleTableSeeder');
        // $this->call('WeightTicketTableSeeder');
        // $this->call('DestinationTableSeeder');
        // $this->call('PickupScheduleTableSeeder');
        // $this->call('SalesOrderTableSeeder');
        // $this->call('ProductOrderTableSeeder');
		
		// $this->call('FarmLocationTableSeeder');
        // $this->call('StackTableSeeder');
        
        // $this->call('ScaleTableSeeder');
        // $this->call('TrailerTableSeeder');
        // $this->call('FeeTableSeeder');
	}
}
