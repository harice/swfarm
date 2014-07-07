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
			array('permissioncategory' => 4, 'permissiontype' => 16),

			array('permissioncategory' => 5, 'permissiontype' => 17),
			array('permissioncategory' => 5, 'permissiontype' => 18),
			array('permissioncategory' => 5, 'permissiontype' => 19),
			array('permissioncategory' => 5, 'permissiontype' => 20),

			array('permissioncategory' => 6, 'permissiontype' => 21),
			array('permissioncategory' => 6, 'permissiontype' => 22),
			array('permissioncategory' => 6, 'permissiontype' => 23),
			array('permissioncategory' => 6, 'permissiontype' => 24),

			array('permissioncategory' => 7, 'permissiontype' => 25),
			array('permissioncategory' => 7, 'permissiontype' => 26),
			array('permissioncategory' => 7, 'permissiontype' => 27),
			array('permissioncategory' => 7, 'permissiontype' => 28),

			array('permissioncategory' => 8, 'permissiontype' => 29),
			array('permissioncategory' => 8, 'permissiontype' => 30),

			array('permissioncategory' => 9, 'permissiontype' => 31),
			array('permissioncategory' => 9, 'permissiontype' => 32),
		);

		DB::table('permissioncategorytype')->insert($permissioncategorytype);
	}

}
