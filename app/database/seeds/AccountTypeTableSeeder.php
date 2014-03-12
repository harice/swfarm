<?php

class AccountTypeTableSeeder extends Seeder {

	public function run()
	{
		$accounttype = array(
			array(
                'name' => 'Producer'
            ),
            array(
                'name' => 'Trucker'
            ),
            array(
                'name' => 'Hauler'
            ),
            array(
                'name' => 'Operator'
            ),
            array(
                'name' => 'Loader'
            ),
            array(
                'name' => 'Driver'
            ),
            array(
                'name' => 'Trailer'
            ),
            array(
                'name' => 'Scale Provider'
            )
		);

		DB::table('accounttype')->insert($accounttype);
	}

}
