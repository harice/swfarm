<?php

class PermissioncategorytypeTableSeeder extends Seeder {

	public function run()
	{
		// DB::table('permissioncategorytype')->truncate();

		$permissioncategorytype = array(
			array('permissioncategory' => 1, 'permissiontype' => 1),
			array('permissioncategory' => 1, 'permissiontype' => 2),
			array('permissioncategory' => 1, 'permissiontype' => 3),
			array('permissioncategory' => 1, 'permissiontype' => 4),

			array('permissioncategory' => 2, 'permissiontype' => 5),
			array('permissioncategory' => 2, 'permissiontype' => 6),
			array('permissioncategory' => 2, 'permissiontype' => 7),
			array('permissioncategory' => 2, 'permissiontype' => 8),

			array('permissioncategory' => 3, 'permissiontype' => 9),
			array('permissioncategory' => 3, 'permissiontype' => 10),
			array('permissioncategory' => 3, 'permissiontype' => 11),
			array('permissioncategory' => 3, 'permissiontype' => 12),

			array('permissioncategory' => 4, 'permissiontype' => 13),
			array('permissioncategory' => 4, 'permissiontype' => 14),
			array('permissioncategory' => 4, 'permissiontype' => 15),
			array('permissioncategory' => 4, 'permissiontype' => 16)
		);

		DB::table('permissioncategorytype')->insert($permissioncategorytype);
	}

}
