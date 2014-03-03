<?php

class UsersTableSeeder extends Seeder {

	public function run()
	{
		// DB::table('users')->truncate();
    $currentdate = new Datetime();
    $currentdate = $currentdate->format('Y-m-d H:i:s');

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
					'created_at' => $currentdate,
					'updated_at' => $currentdate,
//          'created_by_id' => 0,
//          'updated_by_id' => 0,
//          'deleted_by_id' => 0
				)
		);

		DB::table('users')->insert($users);
	}

}
