<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class StackTableSeeder extends Seeder {
    
    public function run()
	{
        $now = date('Y-m-d H:i:s');
        
		$stack = array(
            array(
                'stacknumber'       => 'STACK001',
                'product_id'        => 1,
                'location'          => 'LOCATION1',
                'notes'             => 'Lorem ipsum set amet.',
                'created_at'        => $now,
                'updated_at'        => $now
            )
        );
        
        DB::table('stack')->insert($stack);
	}
    
}
