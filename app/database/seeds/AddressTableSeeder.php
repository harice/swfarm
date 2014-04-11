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
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$address = array(
			array(
                'account' => '1',
                'street' => 'North St.',
                'city' => '2',
                'state' => '2',
                'zipcode' => '29620',
                'country' => '1',
                'type' => '1',
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('address')->insert($address);
	}
    
}
