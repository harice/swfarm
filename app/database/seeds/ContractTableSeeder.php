<?php

class ContractTableSeeder extends Seeder {
    
    public function run()
	{
        $now = new DateTime('NOW');
        $date = $now->format('Y-m-d H:i:s');
        
		$contracts = array(
			array(
                'contract_number' => 'C20140630-0001',
                'account_id' => 1,
                'contract_date_start' => $date,
                'contract_date_end' => $date,
                'user_id' => 1,
                'status_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'contract_number' => 'C20140630-0002',
                'account_id' => 1,
                'contract_date_start' => $date,
                'contract_date_end' => $date,
                'user_id' => 1,
                'status_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'contract_number' => 'C20140630-0003',
                'account_id' => 1,
                'contract_date_start' => $date,
                'contract_date_end' => $date,
                'user_id' => 1,
                'status_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'contract_number' => 'C20140630-0004',
                'account_id' => 1,
                'contract_date_start' => $date,
                'contract_date_end' => $date,
                'user_id' => 1,
                'status_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
            array(
                'contract_number' => 'C20140630-0005',
                'account_id' => 1,
                'contract_date_start' => $date,
                'contract_date_end' => $date,
                'user_id' => 1,
                'status_id' => 1,
                'created_at' => $date,
                'updated_at' => $date
            ),
		);

		DB::table('contract')->insert($contracts);
	}
    
}
