<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class StorageLocationTableSeeder extends Seeder {

    public function run()
    {
        $storagelocation = array(
            array('id' => '1', 'account_id' => '15', 'name' => 'Location A', 'description' => '', 'created_at' => '2014-08-06 11:35:28', 'updated_at' => '2014-08-06 11:35:28')
        );

        DB::table('storagelocation')->insert($storagelocation);
    }
}
