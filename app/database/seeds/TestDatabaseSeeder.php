<?php

class TestDatabaseSeeder extends Seeder {

    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run() {
        Eloquent::unguard();

        $this->call('UsersTableSeeder');
        $this->call('SettingsTableSeeder');
        $this->call('PermissioncategoryTableSeeder');
        $this->call('PermissiontypeTableSeeder');
        $this->call('PermissioncategorytypeTableSeeder');
        $this->call('AccountTypeTableSeeder');
        $this->call('AddressTypeTableSeeder');
        $this->call('ReasonsTableSeeder');
        $this->call('AddressStatesTableSeeder');
        $this->call('InventoryTransactionTypeTableSeeder');

        // Sales Order
        $this->call('LocationTableSeeder');
        $this->call('NatureOfSaleTableSeeder');
        $this->call('StatusTableSeeder');

        // Testing
        // --------------------------------------------------------------------
        $this->call('ProductsTableSeeder');
        $this->call('AccountTableSeeder');
        $this->call('AddressTableSeeder');
        $this->call('ContactTableSeeder');
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
        $this->call('ScaleTableSeeder');
        $this->call('TrailerTableSeeder');
        $this->call('TruckTableSeeder');
        // $this->call('FeeTableSeeder');
        $this->call('ContractTableSeeder');
        $this->call('ContractProductsTableSeeder');
        $this->call('StorageLocationTableSeeder');
        $this->call('SectionTableSeeder');
    }

}
