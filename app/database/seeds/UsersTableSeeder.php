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
					'username' => 'mike.sr',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'mike.sr@swfarm.local',
					'firstname' => 'Mike',
					'lastname' => 'Perez',
          'suffix' => 'Sr',
					'emp_no' => 'E01',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'mike.jr',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'mike.jr@swfarm.local',
					'firstname' => 'Mike',
					'lastname' => 'Perez',
          'suffix' => 'Jr',
					'emp_no' => 'E02',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'vince',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'vince.perez@swfarm.local',
					'firstname' => 'Vince',
					'lastname' => 'Perez',
          'suffix' => '',
					'emp_no' => 'E03',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'eric',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'eric.perez@swfarm.local',
					'firstname' => 'Eric',
					'lastname' => 'Perez',
          'suffix' => '',
					'emp_no' => 'E04',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'dee',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'dee.perez@swfarm.local',
					'firstname' => 'Dee',
					'lastname' => 'Perez',
          'suffix' => '',
					'emp_no' => 'E05',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'robert',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'robert.pouquette@swfarm.local',
					'firstname' => 'Robert',
					'lastname' => 'Pouquette',
          'suffix' => '',
					'emp_no' => 'E06',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'bob',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'bob.dejager@swfarm.local',
					'firstname' => 'Bob',
					'lastname' => 'Dejager',
          'suffix' => '',
					'emp_no' => 'E07',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'user1',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'user1@swfarm.local',
					'firstname' => 'Sample',
					'lastname' => 'User 1',
          'suffix' => '',
					'emp_no' => 'E08',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'user2',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'user2@swfarm.local',
					'firstname' => 'Sample',
					'lastname' => 'User 2',
          'suffix' => '',
					'emp_no' => 'E09',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'user3',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'user3@swfarm.local',
					'firstname' => 'Sample',
					'lastname' => 'User 3',
          'suffix' => '',
					'emp_no' => 'E10',
					'validated' => true,
					'status' => true,
					'deleted' => false
				),
      array(
					'username' => 'user4',
					'password' => Hash::make('abcde.123'),
					'email'	=> 'user4@swfarm.local',
					'firstname' => 'Sample',
					'lastname' => 'User 4',
          'suffix' => '',
					'emp_no' => 'E11',
					'validated' => true,
					'status' => true,
					'deleted' => false
				)
		);

		DB::table('users')->insert($users);
	}

}
