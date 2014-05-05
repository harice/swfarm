<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class FeeTableSeeder extends Seeder {
    
    public function run()
	{
        $now = date('Y-m-d H:i:s');
        
		$fee = array(
            array(
                'account_id'        => 1,
                'type'              => 'scale',
                'fee'               => 10.00,
                'created_at'        => $now,
                'updated_at'        => $now
            ),
            array(
                'account_id'        => 1,
                'type'              => 'trailer',
                'fee'               => 10.00,
                'created_at'        => $now,
                'updated_at'        => $now
            ),
        );
        
        DB::table('fee')->insert($fee);
	}
    
}
