<?php

class StatusTableSeeder extends Seeder {

	public function run()
	{
		$status = array(
            array(
                'id' => 1,
                'name' => 'Open',
                'class' => 'success'
            ),
            array(
                'id' => 2,
                'name' => 'Closed',
                'class' => 'default'
            ),
            array(
                'id' => 3,
                'name' => 'Cancelled',
                'class' => 'danger'
            ),
            array(
                'id' => 4,
                'name' => 'Pending',
                'class' => 'warning'
            ),
            array(
                'id' => 5,
                'name' => 'Bid Cancelled',
                'class' => 'danger'
            ),
            array(
                'id' => 6,
                'name' => 'PO Cancelled',
                'class' => 'danger'
            ),
            array(
                'id' => 7,
                'name' => 'Testing',
                'class' => 'primary'
            ),
        );
        
        DB::table('status')->insert($status);
	}

}
