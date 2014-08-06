<?php

/**
 * Description of FarmLocationTableSeeder
 *
 * @author Das
 */
class SectionTableSeeder extends Seeder {

    public function run() {
        $section = array(
            array('id' => '1', 'storagelocation_id' => '1', 'name' => 'Section A1', 'description' => ''),
            array('id' => '2', 'storagelocation_id' => '1', 'name' => 'Section A2', 'description' => ''),
            array('id' => '3', 'storagelocation_id' => '1', 'name' => 'Section A3', 'description' => '')
        );

        DB::table('section')->insert($section);
    }

}
