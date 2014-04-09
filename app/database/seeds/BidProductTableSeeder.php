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
		$bidproduct = array(
			array(
                'id' => '1',
                'bid_id' => '1',
                'product_id' => '2',
                'stacknumber' => '234',
                'bidprice' => '10.00',
                'tons' => '50.00',
                'bales' => '45',
                'ishold' => '0'
            )
		);

		DB::table('bidproduct')->insert($bidproduct);
	}
    
}
