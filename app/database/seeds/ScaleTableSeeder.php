<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class ScaleTableSeeder extends Seeder {
    
    public function run()
	{
        $now = date('Y-m-d H:i:s');
        
		$scale = array(
            array(
                'account_id'        => 7,
                'name'              => 'Scale 1',
                'rate'              => '0.00',
                'created_at'        => $now,
                'updated_at'        => $now
            ),
            array(
                'account_id'        => 8,
                'name'              => 'Scale 2',
                'rate'              => '0.00',
                'created_at'        => $now,
                'updated_at'        => $now
            )
        );
        
        DB::table('scale')->insert($scale);
	}
    
}
