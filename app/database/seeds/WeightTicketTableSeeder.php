<?php

class WeightTicketTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$weightticket = array(
			array(
                'purchaseorder_id' => 1,
                'pickupschedule_id' => 1,
                'bidproduct_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
			
			array(
                'purchaseorder_id' => 1,
                'pickupschedule_id' => 1,
                'bidproduct_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
			
			array(
                'purchaseorder_id' => 1,
                'pickupschedule_id' => 1,
                'bidproduct_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('weightticket')->insert($weightticket);
	}

}
