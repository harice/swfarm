<?php

class PermissioncategoryTableSeeder extends Seeder {

	public function run()
	{
		// DB::table('permissioncategory')->truncate();

		$permissioncategory = array(
			array('name' => 'Purchase Orders', 'sort' => 1),
			array('name' => 'Sales Orders', 'sort' => 2),
			array('name' => 'Product Management', 'sort' => 3),
			array('name' => 'Contact Management', 'sort' => 4),
			array('name' => 'User Management', 'sort' => 5),
			array('name' => 'Role Management', 'sort' => 6),
			array('name' => 'Account Management', 'sort' => 7),
			array('name' => 'Reports', 'sort' => 8),
			array('name' => 'Admin', 'sort' => 9),
			array('name' => 'Contract Management', 'sort' => 10),
			array('name' => 'Sales', 'sort' => 11),
			array('name' => 'Purchases', 'sort' => 12),
			array('name' => 'Fees & Rates Management', 'sort' => 13),
			array('name' => 'Logistics', 'sort' => 14),
			array('name' => 'Inventory', 'sort' => 15),
		);
		
		DB::table('permissioncategory')->insert($permissioncategory);
	}

}
