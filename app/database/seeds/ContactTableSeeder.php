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
            ),
            array(
                'firstname' => 'Nico',
                'lastname' => 'Rosberg',
                'suffix' => '',
                'position' => '',
                'email' => 'nico@customer1.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 12,
                'rate' => '0.00',
                'created_at' => '2014-07-23 13:10:49',
                'updated_at' => '2014-07-23 13:10:49',
                'deleted_at' => NULL
            ),
            array(
                'firstname' => 'Fernando',
                'lastname' => 'Alonso',
                'suffix' => '',
                'position' => '',
                'email' => 'alonso@customer2.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 13,
                'rate' => '0.00',
                'created_at' => '2014-07-23 13:10:49',
                'updated_at' => '2014-07-23 13:10:49',
                'deleted_at' => NULL
            ),
            array(
                'firstname' => 'Daniel',
                'lastname' => 'Ricciardo',
                'suffix' => '',
                'position' => '',
                'email' => 'ricciardo@customer3.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 14,
                'rate' => '0.00',
                'created_at' => '2014-07-23 13:10:49',
                'updated_at' => '2014-07-23 13:10:49',
                'deleted_at' => NULL
            ),
            array(
                'firstname' => 'Jenson',
                'lastname' => 'Button',
                'suffix' => '',
                'position' => '',
                'email' => 'jenson@producer-a.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 15,
                'rate' => '0.00',
                'created_at' => '2014-07-23 13:10:49',
                'updated_at' => '2014-07-23 13:10:49',
                'deleted_at' => NULL
            ),
            array(
                'firstname' => 'Kevin',
                'lastname' => 'Magnussen',
                'suffix' => '',
                'position' => '',
                'email' => 'kevin@producer-b.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 16,
                'rate' => '0.00',
                'created_at' => '2014-07-23 13:10:49',
                'updated_at' => '2014-07-23 13:10:49',
                'deleted_at' => NULL
            ),
            array(
                'firstname' => 'Felipe',
                'lastname' => 'Massa',
                'suffix' => '',
                'position' => '',
                'email' => 'massa@producer-c.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 17,
                'rate' => '0.00',
                'created_at' => '2014-07-23 13:10:49',
                'updated_at' => '2014-07-23 13:10:49',
                'deleted_at' => NULL
            ),
        );
        
        DB::table('contact')->insert($contacts);
	}

}
