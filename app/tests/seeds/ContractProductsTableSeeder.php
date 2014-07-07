<?php

class ContractProductsTableSeeder extends Seeder {
    
    public function run()
	{
		$contract_products = array(
			array(
                'contract_id' => 1,
                'product_id' => 1,
                'tons' => 100.0000,
                'bales' => 100
            ),
            array(
                'contract_id' => 2,
                'product_id' => 1,
                'tons' => '100.0000',
                'bales' => 100
            ),
            array(
                'contract_id' => 3,
                'product_id' => 1,
                'tons' => '100.0000',
                'bales' => 100
            ),
            array(
                'contract_id' => 4,
                'product_id' => 1,
                'tons' => '100.0000',
                'bales' => 100
            ),
            array(
                'contract_id' => 5,
                'product_id' => 1,
                'tons' => '100.0000',
                'bales' => 100
            ),
		);

		DB::table('contract_products')->insert($contract_products);
	}
    
}
