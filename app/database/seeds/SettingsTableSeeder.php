<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class SettingsTableSeeder extends Seeder {
    
    public function run()
	{
        $now = date('Y-m-d H:i:s');
        
		$settings = array(
            array(
                'name'              => 'freight_rate',
                'value'             => '1.75',
                'created_at'        => $now,
                'updated_at'        => $now
            ),
             array(
                'name'              => 'loading_rate',
                'value'             => '65.00',
                'created_at'        => $now,
                'updated_at'        => $now
            ),
              array(
                'name'              => 'unloading_rate',
                'value'             => '65.00',
                'created_at'        => $now,
                'updated_at'        => $now
            ),
              array(
                'name'              => 'trailer_percentage_rate',
                'value'             => '10',
                'created_at'        => $now,
                'updated_at'        => $now
            )
        );
        
        DB::table('settings')->insert($settings);
	}
    
}
