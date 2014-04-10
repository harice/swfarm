<?php

class PurchaseOrderTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$purchaseorders = array(
			array(
                'id' => '1',
                'bid_id' => '1',
                'pickupstart' => $date,
                'pickupend' => $date,
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('purchaseorder')->insert($purchaseorders);
	}

}
