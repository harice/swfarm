<?php

class WeightTicketTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$weightticket = array(
			array(
                'wtn' => 'WTN20140404-00001',
                'purchaseorder_id' => 1,
                'pickupschedule_id' => 1,
                'bidproduct_id' => 1,
                
                'origin_bales' => 5,
                'origin_gross' => 19.99,
                'origin_tare' => 18.88,
                'origin_net' => 1.11,
                'origin_account_id' => 1,
                'origin_scale_fee' => 10.00,
                
                'destination_bales' => 5,
                'destination_gross' => 19.99,
                'destination_tare' => 18.88,
                'destination_net' => 1.11,
                'destination_account_id' => 1,
                'destination_scale_fee' => 10.00,
                
                'created_at' => $date,
                'updated_at' => $date
            ),
			
			array(
                'wtn' => 'WTN20140404-00002',
                'purchaseorder_id' => 1,
                'pickupschedule_id' => 1,
                'bidproduct_id' => 1,
                
                'origin_bales' => 5,
                'origin_gross' => 19.99,
                'origin_tare' => 18.88,
                'origin_net' => 1.11,
                'origin_account_id' => 1,
                'origin_scale_fee' => 10.00,
                
                'destination_bales' => 5,
                'destination_gross' => 19.99,
                'destination_tare' => 18.88,
                'destination_net' => 1.11,
                'destination_account_id' => 1,
                'destination_scale_fee' => 10.00,
                
                'created_at' => $date,
                'updated_at' => $date
            ),
			
			array(
                'wtn' => 'WTN20140404-00003',
                'purchaseorder_id' => 1,
                'pickupschedule_id' => 1,
                'bidproduct_id' => 1,
                
                'origin_bales' => 5,
                'origin_gross' => 19.99,
                'origin_tare' => 18.88,
                'origin_net' => 1.11,
                'origin_account_id' => 1,
                'origin_scale_fee' => 10.00,
                
                'destination_bales' => 5,
                'destination_gross' => 19.99,
                'destination_tare' => 18.88,
                'destination_net' => 1.11,
                'destination_account_id' => 1,
                'destination_scale_fee' => 10.00,
                
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('weightticket')->insert($weightticket);
	}

}
