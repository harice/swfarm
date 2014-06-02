<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class ReasonsTableSeeder extends Seeder {
    
    public function run()
	{
        $reasons = array(
            array(
                'id'        => 1,
                'reason'              => 'Damaged Product'
            ),
            array(
                'id'        => 2,
                'reason'              => 'Rejected Loads'
            ),
            array(
                'id'        => 3,
                'reason'              => 'No Customer'
            ),
            array(
                'id'        => 4,
                'reason'              => 'No Product Received'
            ),
            array(
                'id'        => 5,
                'reason'              => 'No Producer'
            ),
            array(
                'id'        => 6,
                'reason'              => 'Others'
            )
        );
        
        DB::table('reasons')->insert($reasons);
	}
    
}