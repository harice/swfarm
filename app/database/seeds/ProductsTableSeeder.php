<?php

class ProductsTableSeeder extends Seeder {

	public function run()
	{
		$products = array(
			array(
                'name' => 'Bermuda',
                'description' => "Cynodon is a genus of nine species of grasses, native to warm temperate to tropical regions of the Old World. The genus as a whole as well as its species are commonly known as Bermuda Grass."
            ),
            array(
                'name' => 'Alfalfa',
                'description' => "Alfalfa, Medicago sativa, also called lucerne, is a perennial flowering plant in the pea family Fabaceae cultivated as an important forage crop in many countries around the world."
            ),
            array(
                'name' => 'Orchard Grass',
                'description' => "Dactylis is a genus of grasses in the subfamily Pooideae, native to Europe, Asia, and northern Africa. They are known in English as cock's-foot or cocksfoot grasses, also sometimes as orchard grasses."
            ),
            array(
                'name' => 'Timothy Grass',
                'description' => "Timothy-grass (Phleum pratense), is an abundant perennial grass native to most of Europe except for the Mediterranean region. It is also known simply as timothy, or as meadow cat's-tail or common cat's tail."
            )
		);

		DB::table('products')->insert($products);
	}

}
