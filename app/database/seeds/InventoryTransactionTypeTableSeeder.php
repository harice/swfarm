<?php

/**
 * Description of Inventory Transaction Type Seeder
 *
 * @author Avs
 */
class InventoryTransactionTypeTableSeeder extends Seeder {
    
    public function run()
	{

		$transactionType = array(
            array(
                'id'        => 1,
                'type'              => 'Sales Order',
                'operation' => 'subtract'
            ), 
            array(
                'id'        => 2,
                'type'              => 'Purchase Order',
                'operation' => 'add'
            ),
            array(
                'id'        => 3,
                'type'              => 'Transfer',
                'operation' => 'equal'
            ),
            array(
                'id'        => 4,
                'type'              => 'Issue',
                'operation' => 'subtract'
            ),
            array(
                'id'        => 5,
                'type'              => 'Receipt',
                'operation' => 'add'
            )
        );
        
        DB::table('inventorytransactiontype')->insert($transactionType);
	}
    
}
