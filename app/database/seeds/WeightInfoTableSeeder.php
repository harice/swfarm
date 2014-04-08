<?php

class WeightInfoTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$weightinfo = array(
			array(
                'gross' => 19.99,
                'tare' => 18.88,
                'created_at' => $date,
                'updated_at' => $date
            ),
			
			array(
                'gross' => 19.99,
                'tare' => 18.88,
                'created_at' => $date,
                'updated_at' => $date
            ),
			
			array(
                'gross' => 19.99,
                'tare' => 18.88,
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('weightinfo')->insert($weightinfo);
	}

}
