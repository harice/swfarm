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
                'module'    => 'Create  Purchase Order',
                'text'      => 'create purchase order'
            ),
            array(
                'module'    => 'Update Purchase Order',
                'text'      => 'updated purchase order'
            )
        );
        
        DB::table('notificationtype')->insert($notificationtype);
	}
    
}
