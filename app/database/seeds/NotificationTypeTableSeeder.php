<?php

/**
 * Description of NotificationTypeTableSeeder
 *
 * @author Avs
 */
class NotificationTypeTableSeeder extends Seeder {
    
    public function run()
	{
        
		$notificationtype = array(
            array(
                'id'        => 1,
                'module'    => 'Create  Order',
                'text'      => 'create order'
            ),
            array(
                'id'        => 2,
                'module'    => 'Update Order',
                'text'      => 'updated order'
            ),
            array(
                'id'        => 3,
                'module'    => 'Order Schedule Created',
                'text'      => 'create order schedule'
            ),
            array(
                'id'        => 4,
                'module'    => 'Order Schedule Updated',
                'text'      => 'updated order schedule'
            ),
            array(
                'id'        => 5,
                'module'    => 'Order Weight Ticket Created',
                'text'      => 'created order weight ticket'
            ),
            array(
                'id'        => 6,
                'module'    => 'Order Weight Ticket Updated',
                'text'      => 'updated order weight ticket'
            )
        );
        
        DB::table('notificationtype')->insert($notificationtype);
	}
    
}
