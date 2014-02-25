<?php

class PermissiontypeTableSeeder extends Seeder {

	public function run()
	{
		// DB::table('permissiontype')->truncate();

		$permissiontype = array(
			array('name' => 'View Purchase Order', 'link' => NULL),
			array('name' => 'Add Purchase Order', 'link' => 'add'),
			array('name' => 'Edit Purchase Order', 'link' => NULL),
			array('name' => 'Delete Purchase Order', 'link' => NULL),

			array('name' => 'View Sales Order', 'link' => NULL),
			array('name' => 'Add Sales Order', 'link' => 'add'),
			array('name' => 'Edit Sales Order', 'link' => NULL),
			array('name' => 'Delete Sales Order', 'link' => NULL),

			array('name' => 'View Product', 'link' => NULL),
			array('name' => 'Add Product', 'link' => 'add'),
			array('name' => 'Edit Product', 'link' => NULL),
			array('name' => 'Delete Product', 'link' => NULL),

			array('name' => 'View Contact', 'link' => NULL),
			array('name' => 'Add Contact', 'link' => 'add'),
			array('name' => 'Edit Contact', 'link' => NULL),
			array('name' => 'Delete Contact', 'link' => NULL)
		);

		DB::table('permissiontype')->insert($permissiontype);
	}

}
