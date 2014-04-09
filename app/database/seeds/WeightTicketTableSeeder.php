<?php

class WeightTicketTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$weightticket = array(
			array(
                'bales' => 5,
                'gross' => 19.99,
                'tare' => 18.88,
                'net' => 1.11,
                'po_id' => 10001,
                'product' => 'Alfalfa',
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
                'po_id' => 10001,
                'product' => 'Alfalfa',
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
                'po_id' => 10001,
                'product' => 'Alfalfa',
                'scale' => 'Scale Services',
                'scale_fee' => 10.00,
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('weightticket')->insert($weightticket);
	}

}
