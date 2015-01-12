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
			array('name' => 'Stack Location', 'sort' => 10),
			array('name' => 'Delivery Location', 'sort' => 11),
			array('name' => 'Trailer', 'sort' => 12),
			array('name' => 'Trucker', 'sort' => 13),
			array('name' => 'Scale', 'sort' => 14),
			array('name' => 'Payments', 'sort' => 15),
			array('name' => 'Commission', 'sort' => 16)
		);
		
		DB::table('permissioncategory')->insert($permissioncategory);
	}

}
