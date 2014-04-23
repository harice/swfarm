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
		
        // User
		$this->call('UsersTableSeeder');
        
        // Permissions
		$this->call('PermissioncategoryTableSeeder');
		$this->call('PermissiontypeTableSeeder');
		$this->call('PermissioncategorytypeTableSeeder');
        
        // Account
		$this->call('AccountTypeTableSeeder');
		$this->call('AddressTypeTableSeeder');
        
        // Address
        $this->call('AddressStatesTableSeeder');
        $this->call('AddressCitiesTableSeeder');
        $this->call('AddressZipTableSeeder');


        $this->call('DestinationTableSeeder');
        
        // Testing
        $this->call('ProductsTableSeeder');
        $this->call('AccountTableSeeder');
        $this->call('ContactTableSeeder');
        $this->call('AddressTableSeeder');
        $this->call('BidTableSeeder');
        $this->call('BidProductTableSeeder');
        $this->call('PurchaseOrderTableSeeder');
        $this->call('TransportScheduleTableSeeder');
        $this->call('WeightTicketTableSeeder');
 
        // Sales Order
        $this->call('OriginTableSeeder');
        $this->call('NatureOfSaleTableSeeder');
        
        
        // Testing
//        $this->call('DestinationTableSeeder');
//        $this->call('ProductsTableSeeder');
//        $this->call('AccountTableSeeder');
//        $this->call('ContactTableSeeder');
//        $this->call('AddressTableSeeder');
//        $this->call('BidTableSeeder');
//        $this->call('BidProductTableSeeder');
//        $this->call('PurchaseOrderTableSeeder');
//        $this->call('PickupScheduleTableSeeder');
//        $this->call('WeightTicketTableSeeder');
//        $this->call('SalesOrderTableSeeder');
//        $this->call('ProductOrderTableSeeder');

	}

}
