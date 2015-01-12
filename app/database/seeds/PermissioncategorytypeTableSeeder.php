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

			array('permissioncategory' => 10, 'permissiontype' => 33),
			array('permissioncategory' => 10, 'permissiontype' => 34),
			array('permissioncategory' => 10, 'permissiontype' => 35),
			array('permissioncategory' => 10, 'permissiontype' => 36),

			array('permissioncategory' => 11, 'permissiontype' => 37),
			array('permissioncategory' => 11, 'permissiontype' => 38),
			array('permissioncategory' => 11, 'permissiontype' => 39),
			array('permissioncategory' => 11, 'permissiontype' => 40),

			array('permissioncategory' => 12, 'permissiontype' => 41),
			array('permissioncategory' => 12, 'permissiontype' => 42),
			array('permissioncategory' => 12, 'permissiontype' => 43),
			array('permissioncategory' => 12, 'permissiontype' => 44),

			array('permissioncategory' => 13, 'permissiontype' => 45),
			array('permissioncategory' => 13, 'permissiontype' => 46),
			array('permissioncategory' => 13, 'permissiontype' => 47),
			array('permissioncategory' => 13, 'permissiontype' => 48),

			array('permissioncategory' => 14, 'permissiontype' => 49),
			array('permissioncategory' => 14, 'permissiontype' => 50),
			array('permissioncategory' => 14, 'permissiontype' => 51),
			array('permissioncategory' => 14, 'permissiontype' => 52),

			array('permissioncategory' => 15, 'permissiontype' => 53),
			array('permissioncategory' => 15, 'permissiontype' => 54),
			array('permissioncategory' => 15, 'permissiontype' => 55),
			array('permissioncategory' => 15, 'permissiontype' => 56),

			array('permissioncategory' => 16, 'permissiontype' => 57),
			array('permissioncategory' => 16, 'permissiontype' => 58),
			array('permissioncategory' => 16, 'permissiontype' => 59),
			array('permissioncategory' => 16, 'permissiontype' => 60)
		);

		DB::table('permissioncategorytype')->insert($permissioncategorytype);
	}

}
