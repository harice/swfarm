<?php

class AccountTypeTableSeeder extends Seeder {

	public function run()
	{
		$accounttype = array(
			array(
                'name' => 'Customer'
            ),
            array(
                'name' => 'Hauler'
            ),
            array(
                'name' => 'Loader'
            ),
            array(
                'name' => 'Operator'
            ),
            array(
                'name' => 'Producer'
            ),
            array(
                'name' => 'Scale provider'
            ),
            array(
                'name' => 'Trailer'
            ),
            array(
                'name' => 'Trucker'
            )
		);

		DB::table('accounttype')->insert($accounttype);
	}

}
