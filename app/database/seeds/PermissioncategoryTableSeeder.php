<?php

class PermissioncategoryTableSeeder extends Seeder {

	public function run()
	{
		// DB::table('permissioncategory')->truncate();

		$permissioncategory = array(
			array('name' => 'Purchase Order', 'link' => 'po'),
			array('name' => 'Sales Order', 'link' => 'so'),
			array('name' => 'Product', 'link' => 'product'),
			array('name' => 'Contact', 'link' => 'contact'),
			array('name' => 'User Management', 'link' => 'user'),
			array('name' => 'Role Management', 'link' => 'role'),
		);
		
		DB::table('permissioncategory')->insert($permissioncategory);
	}

}
