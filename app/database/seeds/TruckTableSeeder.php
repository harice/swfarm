<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class TruckTableSeeder extends Seeder {
    
    public function run()
	{
		$seed = array(
            array(
                'account_id' => '11',
                'trucknumber' => 'TRU234',
                'fee' => '10.00',
                'created_at' => '2014-07-23 13:07:00',
                'updated_at' => '2014-07-23 13:07:00',
                'deleted_at' => NULL
            )
        );
        
        DB::table('truck')->insert($seed);
	}
    
}
