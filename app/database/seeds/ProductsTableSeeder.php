<?php

class ProductsTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$products = array(
			array(
                'name' => 'Alfalfa',
                'description' => "Alfalfa is a genus of nine species of grasses, native to warm temperate to tropical regions of the Old World. The genus as a whole as well as its species are commonly known as Bermuda Grass.",
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Bermuda',
                'description' => "Bermuda is a genus of nine species of grasses, native to warm temperate to tropical regions of the Old World. The genus as a whole as well as its species are commonly known as Bermuda Grass.",
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Cow Hay',
                'description' => "Cow Hay is a genus of nine species of grasses, native to warm temperate to tropical regions of the Old World. The genus as a whole as well as its species are commonly known as Bermuda Grass.",
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('products')->insert($products);
	}

}
