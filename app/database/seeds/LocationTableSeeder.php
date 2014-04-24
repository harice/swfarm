<?php

class LocationTableSeeder extends Seeder {

	public function run()
	{
		$location = array(
            array(
                'location' => 'Southwest Farms'
            ),
            array(
                'location' => 'Producer'
            ),
            array(
                'location' => 'Dropship'
            )
        );
        
        DB::table('location')->insert($location);
	}

}
