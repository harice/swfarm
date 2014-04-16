<?php

class OriginTableSeeder extends Seeder {

	public function run()
	{
		$origin = array(
            array(
                'origin' => 'Producer'
            ),
            array(
                'origin' => 'Southwest Farms'
            )
        );
        
        DB::table('origin')->insert($origin);
	}

}
