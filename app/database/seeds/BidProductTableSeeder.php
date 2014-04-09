<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of BidProductTableSeeder
 *
 * @author Das
 */
class BidProductTableSeeder extends Seeder {
    
    public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$bidproduct = array(
			array(
                'id' => '1',
                'bid_id' => '1',
                'product_id' => '2',
                'stacknumber' => '234',
                'bidprice' => '10.00',
                'tons' => '50.00',
                'bales' => '45',
                'ishold' => '0',
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('bidproduct')->insert($bidproduct);
	}
    
}
