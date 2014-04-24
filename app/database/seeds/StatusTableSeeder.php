<?php

class StatusTableSeeder extends Seeder {

	public function run()
	{
		$status = array(
            array(
                'name' => 'Open'
            ),
            array(
                'name' => 'Close'
            ),
            array(
                'name' => 'Cancelled'
            ),
            array(
                'name' => 'Pending'
            ),
        );
        
        DB::table('status')->insert($status);
	}

}
