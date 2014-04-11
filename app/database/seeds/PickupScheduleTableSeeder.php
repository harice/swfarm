<?php

class PickupScheduleTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$pickupschedules = array(
			array(
                'id' => '1',
                'bid_id' => '1',
                'pickupdate' => $date,
                'trucker_id' => '1',
                'distance' => '10.00',
                'fuelcharge' => '10.00',
                'originloader_id' => '1',
                'originloadersfee' => '10.00',
                'destinationloader_id' => '1',
                'destinationloadersfee' => '10.00',
                'truckingrate' => '10.00',
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('pickupschedule')->insert($pickupschedules);
	}

}
