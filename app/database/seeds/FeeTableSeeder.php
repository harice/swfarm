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
                'entity_id'        => 1,
                'entity_type'              => 'Scale',
                'fee'               => 10.00,
                'created_at'        => $now,
                'updated_at'        => $now
            ),
            array(
                'entity_id'        => 1,
                'entity_type'              => 'Trailer',
                'fee'               => 10.00,
                'created_at'        => $now,
                'updated_at'        => $now
            ),
        );
        
        DB::table('fee')->insert($fee);
	}
    
}
