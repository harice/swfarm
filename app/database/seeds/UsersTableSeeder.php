<?php

class UsersTableSeeder extends Seeder {

	public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$users = array(
			array(
                'password' => Hash::make('admin.123'),
                'email'	=> 'admin@swfarm.local',
                'firstname' => 'Admin',
                'lastname' => 'SuperAdmin',
                'suffix' => '',
                'emp_no' => 'SU-123',
                'confirmcode' => 'CONFIRMCODE',
                'validated' => true,
                'status' => true,
                'deleted' => false,
                'created_at' => $date,
                'updated_at' => $date,
            ),
			
			array(
                'password' => Hash::make('1'),
                'email'	=> 'one@one.one',
                'firstname' => 'One',
                'lastname' => 'Der Woman',
                'suffix' => '',
                'emp_no' => 'SU-111',
                'confirmcode' => 'CONFIRMCODE',
                'validated' => true,
                'status' => true,
                'deleted' => false,
                'created_at' => $date,
                'updated_at' => $date,
            ),
			
			array(
                'password' => Hash::make('test1234'),
                'email'	=> 'test@test.test',
                'firstname' => '123',
                'lastname' => 'test',
                'suffix' => '',
                'emp_no' => 'test',
                'confirmcode' => 'CONFIRMCODE',
                'validated' => true,
                'status' => true,
                'deleted' => false,
                'created_at' => $date,
                'updated_at' => $date,
            )
		);

		DB::table('users')->insert($users);
	}

}
