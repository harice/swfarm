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
            )
        );
        
        DB::table('contact')->insert($contacts);
	}

}
