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
            ),
            array(
                'name' => 'Hay Hauler',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 2,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Hay Loader 1',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 3,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Hay Loader 2',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 3,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Hay Operator',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 4,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Hay Producer',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 5,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Hay Scale Provider 1',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 6,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Hay Scale Provider 2',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 6,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Southwest Farms Trucker',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 7,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Hay Trailer',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 7,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Hay Trucker',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 9,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Customer A',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Customer B',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'name' => 'Customer C',
                'website' => 'http://www.haysupplier.com',
                'description' => 'Lorem ipsum set amet.',
                'phone' => '123-434-4343',
                'accounttype' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
		);

        DB::table('account')->insert($accounts);
    }
    
}
