<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class TrailerTableSeeder extends Seeder {
    
    public function run()
	{
        $now = date('Y-m-d H:i:s');
        
		$trailer = array(
            array(
                'account_id'        => 1,
                'number'              => 'Trailer 1',
                'created_at'        => $now,
                'updated_at'        => $now
            )
        );
        
        DB::table('trailer')->insert($trailer);
	}
    
}
