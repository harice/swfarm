<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class FarmLocationTableSeeder extends Seeder {
    
    public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$farmlocation = array(
            array(
                'locationnumber'    => 'L001',
                'status'            => 1,
                'created_at'        => $date,
                'updated_at'        => $date,
            ),
            array(
                'locationnumber'    => 'L002',
                'status'            => 1,
                'created_at'        => $date,
                'updated_at'        => $date,
            )
        );
        
        DB::table('farmlocation')->insert($farmlocation);
	}
    
}
