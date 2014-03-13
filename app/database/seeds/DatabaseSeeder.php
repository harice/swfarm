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
        // $this->call('ProductsTableSeeder');
		$this->call('AccountTypeTableSeeder');
		$this->call('AddressTypeTableSeeder');

	}

}