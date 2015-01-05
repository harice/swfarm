<?php

class PermissiontypeTableSeeder extends Seeder {

	public function run()
	{
		// DB::table('permissiontype')->truncate();

		$permissiontype = array(
			array('name' => 'View Purchase Order', 'description' => NULL),
			array('name' => 'Add Purchase Order', 'description' => NULL),
			array('name' => 'Edit Purchase Order', 'description' => NULL),
			array('name' => 'Cancel Purchase Order', 'description' => NULL),

			array('name' => 'View Sales Order', 'description' => NULL),
			array('name' => 'Add Sales Order', 'description' => NULL),
			array('name' => 'Edit Sales Order', 'description' => NULL),
			array('name' => 'Cancel Sales Order', 'description' => NULL),

			array('name' => 'View Product', 'description' => NULL),
			array('name' => 'Add Product', 'description' => NULL),
			array('name' => 'Edit Product', 'description' => NULL),
			array('name' => 'Delete Product', 'description' => NULL),

			array('name' => 'View Contact', 'description' => NULL),
			array('name' => 'Add Contact', 'description' => NULL),
			array('name' => 'Edit Contact', 'description' => NULL),
			array('name' => 'Delete Contact', 'description' => NULL),

			array('name' => 'View User', 'description' => NULL),
			array('name' => 'Add User', 'description' => NULL),
			array('name' => 'Edit User', 'description' => NULL),
			array('name' => 'Delete User', 'description' => NULL),

			array('name' => 'View Role', 'description' => NULL),
			array('name' => 'Add Role', 'description' => NULL),
			array('name' => 'Edit Role', 'description' => NULL),
			array('name' => 'Delete Role', 'description' => NULL),

			array('name' => 'View Account', 'description' => NULL),
			array('name' => 'Add Account', 'description' => NULL),
			array('name' => 'Edit Account', 'description' => NULL),
			array('name' => 'Delete Account', 'description' => NULL),

			array('name' => 'View Report', 'description' => NULL),
			array('name' => 'Generate Report', 'description' => NULL),

			array('name' => 'View Dashboard', 'description' => NULL),
			array('name' => 'Audit Trail', 'description' => NULL),

			array('name' => 'Add Contract', 'description' => NULL),
			array('name' => 'View Contract', 'description' => NULL),
			array('name' => 'Edit Contract', 'description' => NULL),
			array('name' => 'Close Contract', 'description' => NULL),

			array('name' => 'Close Sales Order', 'description' => NULL),

			array('name' => 'Close Purchase Order', 'description' => NULL),

			array('name' => 'View Fees and Rates', 'description' => NULL),
			array('name' => 'Add Fees and Rates', 'description' => NULL),
			array('name' => 'Edit Fees and Rates', 'description' => NULL),
			array('name' => 'Delete Fees and Rates', 'description' => NULL),

			array('name' => 'View Schedule', 'description' => NULL),
			array('name' => 'Add Schedule', 'description' => NULL),
			array('name' => 'Edit Schedule', 'description' => NULL),
			array('name' => 'Delete Schedule', 'description' => NULL),
			array('name' => 'View Weight Info', 'description' => NULL),
			array('name' => 'Add Weight Info', 'description' => NULL),
			array('name' => 'Edit Weight Info', 'description' => NULL),
			array('name' => 'Close Weight Info', 'description' => NULL),

			array('name' => 'Add Manual Inventory Transaction', 'description' => NULL),
			array('name' => 'View Manual and Auto Inventory Transaction', 'description' => NULL)
		);

		DB::table('permissiontype')->insert($permissiontype);
	}

}
