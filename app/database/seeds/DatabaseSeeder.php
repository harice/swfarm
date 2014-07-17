<?php

class DatabaseSeeder extends Seeder {

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
    }
}
