<?php

class DestinationTableSeeder extends Seeder {

	public function run()
	{
		$destination = array(
			array(
                'destination' => 'Deliver to Southwest Farms'
            ),
            array(
                'destination' => 'Store to Farm'
            ),
            array(
                'destination' => 'Dropship'
            )
		);

		DB::table('destination')->insert($destination);
	}

}
