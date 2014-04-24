<?php

class SalesOrderTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$salesorder = array(
            array(
                'so_number' => 'S20140401-0001',
                'origin_id' => 1,
                'nature_of_sale_id' => 1,
                'customer_id' => 1,
                'address_id' => 1,
                'date_of_sale' => $date,
                'delivery_date_start' => $date,
                'delivery_date_end' => $date,
                'status' => 'Open',
                'notes' => 'Lorem ipsum set amet.',
                'user_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'so_number' => 'S20140401-0002',
                'origin_id' => 1,
                'nature_of_sale_id' => 1,
                'customer_id' => 1,
                'address_id' => 1,
                'date_of_sale' => $date,
                'delivery_date_start' => $date,
                'delivery_date_end' => $date,
                'status' => 'Open',
                'notes' => 'Lorem ipsum set amet.',
                'user_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
        );
        
        DB::table('salesorder')->insert($salesorder);
	}

}
