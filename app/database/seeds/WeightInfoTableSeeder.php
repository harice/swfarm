<?php

class WeightInfoTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$weightinfo = array(
			array(
                'weightinfo_type' => 'Origin',
                'bales' => 5,
                'gross' => 19.99,
                'tare' => 18.88,
                'net' => 1.11,
                'scale' => 'Scale Services',
                'scale_fee' => 10.00,
                'weightticket_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
			array(
                'weightinfo_type' => 'Destination',
                'bales' => 5,
                'gross' => 19.99,
                'tare' => 18.88,
                'net' => 1.11,
                'scale' => 'Scale Services',
                'scale_fee' => 10.00,
                'weightticket_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
			array(
                'weightinfo_type' => 'Origin',
                'bales' => 5,
                'gross' => 19.99,
                'tare' => 18.88,
                'net' => 1.11,
                'scale' => 'Scale Services',
                'scale_fee' => 10.00,
                'weightticket_id' => 2,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'weightinfo_type' => 'Destination',
                'bales' => 5,
                'gross' => 19.99,
                'tare' => 18.88,
                'net' => 1.11,
                'scale' => 'Scale Services',
                'scale_fee' => 10.00,
                'weightticket_id' => 2,
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('weightinfo')->insert($weightinfo);
	}

}
