<?php

class UsersTableSeeder extends Seeder {

	public function run()
	{
		// DB::table('users')->truncate();

		$users = array(
			array(
					'username' => 'admin',
					'password' => Hash::make('admin.123'),
					'email'	=> 'admin@swfarm.local',
					'firstname' => 'Admin',
					'lastname' => 'SuperAdmin',
					'emp_no' => 'SU-123',
					'validated' => true,
					'status' => true,
					'deleted' => false,
					'created_at' => new Datetime(),
					'updated_at' => new Datetime()
				)
		);

		DB::table('users')->insert($users);
	}

}
