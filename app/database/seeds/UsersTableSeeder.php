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
                'emp_no' => 'SU-ADM',
                'confirmcode' => 'CONFIRMCODE',
                'validated' => true,
                'status' => true,
                'deleted' => false,
                'created_at' => $date,
                'updated_at' => $date,
            ),
			
			array(
                'password' => Hash::make('admin.123'),
                'email' => 'vince@wesellhay.com',
                'firstname' => 'Vince',
                'lastname' => 'Perez',
                'suffix' => '',
                'emp_no' => 'OA-PEREVIN',
                'confirmcode' => 'CONFIRMCODE',
                'validated' => true,
                'status' => true,
                'deleted' => false,
                'created_at' => $date,
                'updated_at' => $date,
            ),

            array(
                'password' => Hash::make('admin.123'),
                'email' => 'eric@wesellhay.com',
                'firstname' => 'Eric',
                'lastname' => 'Perez',
                'suffix' => '',
                'emp_no' => 'OA-PEREERI',
                'confirmcode' => 'CONFIRMCODE',
                'validated' => true,
                'status' => true,
                'deleted' => false,
                'created_at' => $date,
                'updated_at' => $date,
            ),
            
            array(
                'password' => Hash::make('admin.123'),
                'email' => 'janet@wesellhay.com',
                'firstname' => 'Janet',
                'lastname' => 'Campos',
                'suffix' => '',
                'emp_no' => 'OF-CAMPJAN',
                'confirmcode' => 'CONFIRMCODE',
                'validated' => true,
                'status' => true,
                'deleted' => false,
                'created_at' => $date,
                'updated_at' => $date,
            ),
            
            array(
                'password' => Hash::make('admin.123'),
                'email' => 'annita@wesellhay.com',
                'firstname' => 'Annita',
                'lastname' => 'Ortega',
                'suffix' => '',
                'emp_no' => 'OF-ORTEANN',
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
