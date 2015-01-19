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
			// array('name' => 'Sales', 'sort' => 11),
			// array('name' => 'Purchases', 'sort' => 12),
			array('name' => 'Settings', 'sort' => 11),
			array('name' => 'Logistics', 'sort' => 12),
			array('name' => 'Inventory', 'sort' => 13),

			array('name' => 'Stack Location', 'sort' => 14),
			array('name' => 'Delivery Location', 'sort' => 15),
			array('name' => 'Trailer', 'sort' => 16),
			array('name' => 'Trucker', 'sort' => 17),
			array('name' => 'Scale', 'sort' => 18),
			array('name' => 'Payments', 'sort' => 19),
			array('name' => 'Commission', 'sort' => 20)

		);
		
		DB::table('permissioncategory')->insert($permissioncategory);
	}

}
