<?php

class StatusTableSeeder extends Seeder {

	public function run()
	{
		$status = array(
            array(
                'name' => 'Open',
                'class' => 'success'
            ),
            array(
                'name' => 'Close',
                'class' => 'default'
            ),
            array(
                'name' => 'Cancelled',
                'class' => 'danger'
            ),
            array(
                'name' => 'Pending',
                'class' => 'warning'
            ),
        );
        
        DB::table('status')->insert($status);
	}

}
