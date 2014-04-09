<?php

class WeightInfoTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$weightinfo = array(
			array(
                'bales' => 5,
                'gross' => 19.99,
                'tare' => 18.88,
                'net' => 1.11,
                'scale' => 'Scale Services',
                'scale_fee' => 10.00,
                'created_at' => $date,
                'updated_at' => $date
            ),
			
			array(
                'bales' => 5,
                'gross' => 19.99,
                'tare' => 18.88,
                'net' => 1.11,
                'scale' => 'Scale Services',
                'scale_fee' => 10.00,
                'created_at' => $date,
                'updated_at' => $date
            ),
			
			array(
                'bales' => 5,
                'gross' => 19.99,
                'tare' => 18.88,
                'net' => 1.11,
                'scale' => 'Scale Services',
                'scale_fee' => 10.00,
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('weightinfo')->insert($weightinfo);
	}

}
