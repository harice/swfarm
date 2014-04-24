<?php

class NatureOfSaleTableSeeder extends Seeder {

	public function run()
	{
		$natureofsale = array(
            array(
                'name' => 'Reservation'
            ),
            array(
                'name' => 'Incoming'
            ),
            array(
                'name' => 'Outgoing'
            )
        );
        
        DB::table('natureofsale')->insert($natureofsale);
	}

}
