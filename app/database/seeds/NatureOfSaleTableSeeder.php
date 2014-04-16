<?php

class NatureOfSaleTableSeeder extends Seeder {

	public function run()
	{
		$nature_of_sale = array(
            array(
                'nature_of_sale' => 'Reservation'
            ),
            array(
                'nature_of_sale' => 'Incoming'
            ),
            array(
                'nature_of_sale' => 'Outgoing'
            )
        );
        
        DB::table('nature_of_sale')->insert($nature_of_sale);
	}

}
