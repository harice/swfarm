<?php

class AddressStatesTableSeeder extends Seeder {

	public function run()
	{
		$states = array(
            array('state' => 'Alaska','state_code' => 'AK'),
            array('state' => 'Alabama','state_code' => 'AL'),
            array('state' => 'Arkansas','state_code' => 'AR'),
            array('state' => 'Arizona','state_code' => 'AZ'),
            array('state' => 'California','state_code' => 'CA'),
            array('state' => 'Colorado','state_code' => 'CO'),
            array('state' => 'Connecticut','state_code' => 'CT'),
            array('state' => 'District of Columbia','state_code' => 'DC'),
            array('state' => 'Delaware','state_code' => 'DE'),
            array('state' => 'Florida','state_code' => 'FL'),
            array('state' => 'Georgia','state_code' => 'GA'),
            array('state' => 'Hawaii','state_code' => 'HI'),
            array('state' => 'Iowa','state_code' => 'IA'),
            array('state' => 'Idaho','state_code' => 'ID'),
            array('state' => 'Illinois','state_code' => 'IL'),
            array('state' => 'Indiana','state_code' => 'IN'),
            array('state' => 'Kansas','state_code' => 'KS'),
            array('state' => 'Kentucky','state_code' => 'KY'),
            array('state' => 'Louisiana','state_code' => 'LA'),
            array('state' => 'Massachusetts','state_code' => 'MA'),
            array('state' => 'Maryland','state_code' => 'MD'),
            array('state' => 'Maine','state_code' => 'ME'),
            array('state' => 'Michigan','state_code' => 'MI'),
            array('state' => 'Minnesota','state_code' => 'MN'),
            array('state' => 'Missouri','state_code' => 'MO'),
            array('state' => 'Mississippi','state_code' => 'MS'),
            array('state' => 'Montana','state_code' => 'MT'),
            array('state' => 'North Carolina','state_code' => 'NC'),
            array('state' => 'North Dakota','state_code' => 'ND'),
            array('state' => 'Nebraska','state_code' => 'NE'),
            array('state' => 'New Hampshire','state_code' => 'NH'),
            array('state' => 'New Jersey','state_code' => 'NJ'),
            array('state' => 'New Mexico','state_code' => 'NM'),
            array('state' => 'Nevada','state_code' => 'NV'),
            array('state' => 'New York','state_code' => 'NY'),
            array('state' => 'Ohio','state_code' => 'OH'),
            array('state' => 'Oklahoma','state_code' => 'OK'),
            array('state' => 'Oregon','state_code' => 'OR'),
            array('state' => 'Pennsylvania','state_code' => 'PA'),
            array('state' => 'Rhode Island','state_code' => 'RI'),
            array('state' => 'South Carolina','state_code' => 'SC'),
            array('state' => 'South Dakota','state_code' => 'SD'),
            array('state' => 'Tennessee','state_code' => 'TN'),
            array('state' => 'Texas','state_code' => 'TX'),
            array('state' => 'Utah','state_code' => 'UT'),
            array('state' => 'Virginia','state_code' => 'VA'),
            array('state' => 'Vermont','state_code' => 'VT'),
            array('state' => 'Washington','state_code' => 'WA'),
            array('state' => 'Wisconsin','state_code' => 'WI'),
            array('state' => 'West Virginia','state_code' => 'WV'),
            array('state' => 'Wyoming','state_code' => 'WY'),
            array('state' => 'Puerto Rico','state_code' => 'PR')
			
			/*
			array('state' => 'Alaska','state_code' => 'AK'),
            array('state' => 'Alabama','state_code' => 'AL'),
            array('state' => 'Arkansas','state_code' => 'AR'),
			*/
		);

		DB::table('address_states')->insert($states);
	}

}
