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
		);
		
		DB::table('permissioncategory')->insert($permissioncategory);
	}

}
