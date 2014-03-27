<?php

class AddressTypeTableSeeder extends Seeder {

	public function run()
	{
		$addresstype = array(
			array(
                'name' => 'Business Address'
            ),
            array(
                'name' => 'Mailing Address'
            ),
            array(
                'name' => 'Stack Address'
            )
		);

		DB::table('addresstype')->insert($addresstype);
	}

}
