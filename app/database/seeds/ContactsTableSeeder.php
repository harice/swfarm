<?php

class ContactsTableSeeder extends Seeder {

	public function run()
	{
		$contacts = array(
			array(
                'firstname' => 'John',
                'lastname' => 'Watson',
                'position' => 'Doctor',
                'email'	=> 'john@swfarm.local',
                'phone' => '09152225555',
                'mobile' => '09152229999',
                'account' => 2
            ),
            array(
                'firstname' => 'Sherlock',
                'lastname' => 'Holmes',
                'position' => 'Private Investigator',
                'email'	=> 'sherlock@swfarm.local',
                'phone' => '09152225555',
                'mobile' => '09152229999',
                'account' => 1
            )
		);

		DB::table('contact')->insert($contacts);
	}

}
