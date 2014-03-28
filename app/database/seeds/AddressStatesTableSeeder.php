<?php

class AddressStatesTableSeeder extends Seeder {

	public function run()
	{
		$states = array(
            array('id' => '1','state' => 'Alaska','state_code' => 'AK'),
            array('id' => '2','state' => 'Alabama','state_code' => 'AL'),
            array('id' => '3','state' => 'Arkansas','state_code' => 'AR'),
            array('id' => '4','state' => 'Arizona','state_code' => 'AZ'),
            array('id' => '5','state' => 'California','state_code' => 'CA'),
            array('id' => '6','state' => 'Colorado','state_code' => 'CO'),
            array('id' => '7','state' => 'Connecticut','state_code' => 'CT'),
            array('id' => '8','state' => 'District of Columbia','state_code' => 'DC'),
            array('id' => '9','state' => 'Delaware','state_code' => 'DE'),
            array('id' => '10','state' => 'Florida','state_code' => 'FL'),
            array('id' => '11','state' => 'Georgia','state_code' => 'GA'),
            array('id' => '12','state' => 'Hawaii','state_code' => 'HI'),
            array('id' => '13','state' => 'Iowa','state_code' => 'IA'),
            array('id' => '14','state' => 'Idaho','state_code' => 'ID'),
            array('id' => '15','state' => 'Illinois','state_code' => 'IL'),
            array('id' => '16','state' => 'Indiana','state_code' => 'IN'),
            array('id' => '17','state' => 'Kansas','state_code' => 'KS'),
            array('id' => '18','state' => 'Kentucky','state_code' => 'KY'),
            array('id' => '19','state' => 'Louisiana','state_code' => 'LA'),
            array('id' => '20','state' => 'Massachusetts','state_code' => 'MA'),
            array('id' => '21','state' => 'Maryland','state_code' => 'MD'),
            array('id' => '22','state' => 'Maine','state_code' => 'ME'),
            array('id' => '23','state' => 'Michigan','state_code' => 'MI'),
            array('id' => '24','state' => 'Minnesota','state_code' => 'MN'),
            array('id' => '25','state' => 'Missouri','state_code' => 'MO'),
            array('id' => '26','state' => 'Mississippi','state_code' => 'MS'),
            array('id' => '27','state' => 'Montana','state_code' => 'MT'),
            array('id' => '28','state' => 'North Carolina','state_code' => 'NC'),
            array('id' => '29','state' => 'North Dakota','state_code' => 'ND'),
            array('id' => '30','state' => 'Nebraska','state_code' => 'NE'),
            array('id' => '31','state' => 'New Hampshire','state_code' => 'NH'),
            array('id' => '32','state' => 'New Jersey','state_code' => 'NJ'),
            array('id' => '33','state' => 'New Mexico','state_code' => 'NM'),
            array('id' => '34','state' => 'Nevada','state_code' => 'NV'),
            array('id' => '35','state' => 'New York','state_code' => 'NY'),
            array('id' => '36','state' => 'Ohio','state_code' => 'OH'),
            array('id' => '37','state' => 'Oklahoma','state_code' => 'OK'),
            array('id' => '38','state' => 'Oregon','state_code' => 'OR'),
            array('id' => '39','state' => 'Pennsylvania','state_code' => 'PA'),
            array('id' => '40','state' => 'Rhode Island','state_code' => 'RI'),
            array('id' => '41','state' => 'South Carolina','state_code' => 'SC'),
            array('id' => '42','state' => 'South Dakota','state_code' => 'SD'),
            array('id' => '43','state' => 'Tennessee','state_code' => 'TN'),
            array('id' => '44','state' => 'Texas','state_code' => 'TX'),
            array('id' => '45','state' => 'Utah','state_code' => 'UT'),
            array('id' => '46','state' => 'Virginia','state_code' => 'VA'),
            array('id' => '47','state' => 'Vermont','state_code' => 'VT'),
            array('id' => '48','state' => 'Washington','state_code' => 'WA'),
            array('id' => '49','state' => 'Wisconsin','state_code' => 'WI'),
            array('id' => '50','state' => 'West Virginia','state_code' => 'WV'),
            array('id' => '51','state' => 'Wyoming','state_code' => 'WY'),
            array('id' => '52','state' => 'Puerto Rico','state_code' => 'PR')
		);

		DB::table('addressstates')->insert($states);
	}

}
