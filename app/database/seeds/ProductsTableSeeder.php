<?php

class ProductsTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$products = array(
			array(
                'name' => 'Alfalfa',
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Bermuda',
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Bermuda Straw',
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Cow Hay',
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Haul',
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Oat',
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Sudan Hay',
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Timothy',
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Wheat Straw',
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('products')->insert($products);
	}

}
