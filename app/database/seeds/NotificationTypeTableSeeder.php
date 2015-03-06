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
                'module'    => 'Create  Purchase Order',
                'text'      => 'create purchase order'
            ),
            array(
                'id'        => 2,
                'module'    => 'Update Purchase Order',
                'text'      => 'updated purchase order'
            ),
            array(
                'id'        => 3,
                'module'    => 'Purchase Order Schedule Created',
                'text'      => 'create purchase order schedule'
            ),
            array(
                'id'        => 4,
                'module'    => 'Purchase Order Schedule Updated',
                'text'      => 'updated purchase order schedule'
            ),
            array(
                'id'        => 5,
                'module'    => 'Purchase Order Weight Ticket Created',
                'text'      => 'created purchase order weight ticket'
            ),
            array(
                'id'        => 6,
                'module'    => 'Purchase Order Weight Ticket Updated',
                'text'      => 'updated purchase order weight ticket'
            ),
            array(
                'id'        => 7,
                'module'    => 'Sales Order Created',
                'text'      => 'created sales order'
            ),
            array(
                'id'        => 8,
                'module'    => 'Sales Order Updated',
                'text'      => 'updated sales order'
            ),
            array(
                'id'        => 9,
                'module'    => 'Sales Order Schedule Created',
                'text'      => 'create sales order schedule'
            ),
            array(
                'id'        => 10,
                'module'    => 'Sales Order Schedule Updated',
                'text'      => 'updated sales order schedule'
            ),
            array(
                'id'        => 11,
                'module'    => 'Sales Order Weight Ticket Created',
                'text'      => 'creates sales order weight ticket'
            ),
            array(
                'id'        => 12,
                'module'    => 'Sales Order Weight Ticket Updated',
                'text'      => 'updated sales order weight ticket'
            )
        );
        
        DB::table('notificationtype')->insert($notificationtype);
	}
    
}
