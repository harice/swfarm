<?php

class AccountTableSeeder extends Seeder {
    
    public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$accounts = array(
			array(
                'name' => 'Hay Customer',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 1,
                'created_at' => $date,
                'updated_at' => $date
            )
		);

		DB::table('account')->insert($accounts);
	}
    
}
