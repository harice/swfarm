<?php

class ContactTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$contacts = array(
            array(
                'firstname' => 'Lewis',
                'lastname' => 'Hamilton',
                'suffix' => '',
                'position' => '',
                'email' => 'lewis@hamilton.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 1,
                'rate' => '0.00',
                'created_at' => $date,
                'updated_at' => $date,
                'deleted_at' => NULL
            ),
            array(
                'firstname' => 'John Loader',
                'lastname' => 'Smith',
                'suffix' => '',
                'position' => '',
                'email' => 'smith@hamilton.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 3,
                'rate' => '0.00',
                'created_at' => $date,
                'updated_at' => $date,
                'deleted_at' => NULL
            ),
            array(
                'firstname' => 'Lou Loader',
                'lastname' => 'Vega',
                'suffix' => '',
                'position' => '',
                'email' => 'vega@hamilton.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 4,
                'rate' => '0.00',
                'created_at' => $date,
                'updated_at' => $date,
                'deleted_at' => NULL
            ),
            array(
                'firstname' => 'Chuckie',
                'lastname' => 'Truckie',
                'suffix' => '',
                'position' => '',
                'email' => 'truckie@hamilton.com',
                'phone' => '(999) 999-9999',
                'mobile' => '',
                'account' => 11,
                'rate' => '0.00',
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
                'created_at' => $date,
                'updated_at' => $date,
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
                'created_at' => $date,
                'updated_at' => $date,
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
                'created_at' => $date,
                'updated_at' => $date,
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
                'created_at' => $date,
                'updated_at' => $date,
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
                'created_at' => $date,
                'updated_at' => $date,
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
                'created_at' => $date,
                'updated_at' => $date,
                'deleted_at' => NULL
            ),
        );
        
        DB::table('contact')->insert($contacts);
	}

}
