<?php

class ProductOrderTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$productorder = array(
            array(
                'salesorder_id' => 1,
                'product_id' => 1,
                'description' => 'Sample product order.',
                'stacknumber' => 'S123',
                'tons' => 5.23,
                'bales' => 10,
                'unitprice' => 10.00,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'salesorder_id' => 1,
                'product_id' => 2,
                'description' => 'Sample product order.',
                'stacknumber' => 'S123',
                'tons' => 5.23,
                'bales' => 10,
                'unitprice' => 10.00,
                'created_at' => $date,
                'updated_at' => $date
            ),
        );
        
        DB::table('productorder')->insert($productorder);
	}

}
