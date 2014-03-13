<?php

class AddressTypeTableSeeder extends Seeder {

	public function run()
	{
		$addresstype = array(
			array(
                'name' => 'Billing Address'
            ),
            array(
                'name' => 'Residential Address'
            ),
            array(
                'name' => 'Business Address'
            )
		);

		DB::table('addresstype')->insert($addresstype);
	}

}
