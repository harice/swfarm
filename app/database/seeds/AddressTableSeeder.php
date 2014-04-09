<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 * Description of AddressTableSeeder
 *
 * @author Das
 */
class AddressTableSeeder extends Seeder {
    
    public function run()
	{
		$address = array(
			array(
                'account' => '1',
                'street' => 'North St.',
                'city' => '2',
                'state' => '2',
                'zipcode' => '29620',
                'country' => '1',
                'type' => '1'
            )
		);

		DB::table('address')->insert($address);
	}
    
}
