<?php

class AccountTypeTableSeeder extends Seeder {

	public function run()
	{  
        //do not interchange the ids, these are the preset account type of the system used
		$accounttype = array(
			array(
                'id' => 1,
                'name' => 'Customer'
            ),
            array(
                'id' => 2,
                'name' => 'Hauler'
            ),
            array(
                'id' => 3,
                'name' => 'Loader'
            ),
            array(
                'id' => 4,
                'name' => 'Operator'
            ),
            array(
                'id' => 5,
                'name' => 'Producer'
            ),
            array(
                'id' => 6,
                'name' => 'Scale provider'
            ),
            array(
                'id' => 7,
                'name' => 'Trailer'
            ),
            array(
                'id' => 8,
                'name' => 'Trucker'
            ),
            array(
                'id' => 9,
                'name' => 'Southwest Farms Trucker'
            ),
            array(
                'id' => 10,
                'name' => 'Warehouse'
            )
		);

		DB::table('accounttype')->insert($accounttype);
	}

}
