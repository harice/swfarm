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
                'account_id'        => 1,
                'name'              => 'Scale 1',
                'created_at'        => $now,
                'updated_at'        => $now
            )
        );
        
        DB::table('scale')->insert($scale);
	}
    
}
