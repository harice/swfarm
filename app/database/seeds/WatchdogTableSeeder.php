<?php

class WatchdogTableSeeder extends Seeder {

	public function run()
	{
		// DB::table('watchdog')->truncate();

		$log = array(
			array(
        'user_id' => 1,
        'message'	=> 'Updated Blog'
      ),
      array(
        'user_id' => 1,
        'message'	=> 'Updated Article'
      ),
      array(
        'user_id' => 1,
        'message'	=> 'Updated News'
      ),
      array(
        'user_id' => 1,
        'message'	=> 'Updated User'
      ),
      array(
        'user_id' => 1,
        'message'	=> 'Updated Content'
      ),
      array(
        'user_id' => 1,
        'message'	=> 'Updated File'
      )
		);

		DB::table('watchdog')->insert($log);
	}

}
