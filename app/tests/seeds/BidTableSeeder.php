<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of BidTableSeeder
 *
 * @author Das
 */
class BidTableSeeder extends Seeder {
    
    public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$bids = array(
			array(
                'bidnumber' => 'B20140409-0001',
                'destination_id' => '1',
                'producer_id' => '1',
                'address_id' => '1',
                'user_id' => '1',
                'status' => 'Closed',
                'notes' => 'Notes: Lorem ipsum set amet.',
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('bid')->insert($bids);
	}
    
}
