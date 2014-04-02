<?php

class WeightTicketTypeTableSeeder extends Seeder {

	public function run()
	{
		$types = array(
			array(
                'name' => 'Origin'
            ),
            array(
                'name' => 'Destination'
            )
		);

		DB::table('weighttickettype')->insert($types);
	}

}
