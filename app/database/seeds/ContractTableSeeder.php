<?php

class ContractTableSeeder extends Seeder {
    
    public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$contracts = array(
            array(
                'contract_number' => 'C20140723-0001',
                'account_id' => '12',
                'contract_date_start' => '2014-07-22 00:00:00',
                'contract_date_end' => '2015-07-22 00:00:00',
                'user_id' => '1',
                'status_id' => '1',
                'created_at' => '2014-07-22 16:09:18',
                'updated_at' => '2014-07-22 16:09:18'
            ),
            array(
                'contract_number' => 'C20140723-0002',
                'account_id' => '13',
                'contract_date_start' => '2014-07-22 00:00:00',
                'contract_date_end' => '2015-07-22 00:00:00',
                'user_id' => '1',
                'status_id' => '1',
                'created_at' => '2014-07-22 16:09:18',
                'updated_at' => '2014-07-22 16:09:18'
            ),
            array(
                'contract_number' => 'C20140723-0003',
                'account_id' => '14',
                'contract_date_start' => '2014-07-22 00:00:00',
                'contract_date_end' => '2015-07-22 00:00:00',
                'user_id' => '1',
                'status_id' => '1',
                'created_at' => '2014-07-22 16:09:18',
                'updated_at' => '2014-07-22 16:09:18'
            ),
		);

		DB::table('contract')->insert($contracts);
	}
    
}
