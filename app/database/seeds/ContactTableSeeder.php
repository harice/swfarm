<?php

class ContactTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$contacts = array(
            array(
                'id' => '1',
                'firstname' => 'Lewis',
                'lastname' => 'Hamilton',
                'suffix' => '',
                'position' => '',
                'email' => 'lewis@hamilton.com',
                'phone' => '111-111-1111',
                'mobile' => '',
                'account' => 1,
                'created_at' => $date,
                'updated_at' => $date,
                'deleted_at' => NULL
            ),
            array(
                'id' => '2',
                'firstname' => 'John Loader',
                'lastname' => 'Smith',
                'suffix' => '',
                'position' => '',
                'email' => 'smith@hamilton.com',
                'phone' => '111-111-1111',
                'mobile' => '',
                'account' => 3,
                'created_at' => $date,
                'updated_at' => $date,
                'deleted_at' => NULL
            ),
            array(
                'id' => '3',
                'firstname' => 'Lou Loader',
                'lastname' => 'Vega',
                'suffix' => '',
                'position' => '',
                'email' => 'vega@hamilton.com',
                'phone' => '111-111-1111',
                'mobile' => '',
                'account' => 4,
                'created_at' => $date,
                'updated_at' => $date,
                'deleted_at' => NULL
            ),
            array(
                'id' => '4',
                'firstname' => 'Chuckie',
                'lastname' => 'Truckie',
                'suffix' => '',
                'position' => '',
                'email' => 'truckie@hamilton.com',
                'phone' => '111-111-1111',
                'mobile' => '',
                'account' => 11,
                'created_at' => $date,
                'updated_at' => $date,
                'deleted_at' => NULL
            )
        );
        
        DB::table('contact')->insert($contacts);
	}

}
