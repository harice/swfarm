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
		$bids = array(
			array(
                'bidnumber' => 'B20140409-0001',
                'destination_id' => '1',
                'producer_id' => '1',
                'address_id' => '1',
                'user_id' => '1',
                'status' => 'Closed',
                'notes' => 'Notes: Lorem ipsum set amet.',
                'ponumber' => 'P20140409-0001',
                'po_date' => '2014-04-09 01:39:25',
                'po_status' => 'Open'
            )
		);

		DB::table('bid')->insert($bids);
	}
    
}
