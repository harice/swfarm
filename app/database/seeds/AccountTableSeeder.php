<?php

class AccountTableSeeder extends Seeder {
    
    public function run()
	{
		$accounts = array(
			array(
                'name' => 'Hay Supplier',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => '5'
            )
		);

		DB::table('account')->insert($accounts);
	}
    
}
