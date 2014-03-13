<?php

class UsersTableSeeder extends Seeder {

	public function run()
	{
		$users = array(
			array(
                'username' => 'admin',
                'password' => Hash::make('admin.123'),
                'email'	=> 'admin@swfarm.local',
                'firstname' => 'Admin',
                'lastname' => 'SuperAdmin',
                'suffix' => '',
                'emp_no' => 'SU-123',
                'validated' => true,
                'status' => true,
                'deleted' => false
            ),
			
			array(
                'username' => '1',
                'password' => Hash::make('1'),
                'email'	=> 'one@one.one',
                'firstname' => 'One',
                'lastname' => 'Der Woman',
                'suffix' => '',
                'emp_no' => 'SU-111',
                'validated' => true,
                'status' => true,
                'deleted' => false
            )
		);

		DB::table('users')->insert($users);
	}

}
