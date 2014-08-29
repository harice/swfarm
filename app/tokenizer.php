<?php 

class Tokenizer {

	public static function validate()
	{
		$ip_address = ip2long(Request::server('REMOTE_ADDR'));
		if(!$ip_address) $ip_address = ip2long('127.0.0.1');

		$token = Token::where('id', '=', Cookie::get('ihYF23kouGY'))
						->where('ip_address', '=', $ip_address)
						->first();
		if($token) {
			$diff = ( ( time() - $token->last_activity ) / 60 ) % 60;
			if($diff > Config::get('session.lifetime')) return false;
			if(strcmp($token->user_agent, Request::header('user_agent')) !==0 ) return false;

			return true;
		}

		return false;
	}

	public static function store()
	{
		$ip_address = ip2long(Request::server('REMOTE_ADDR'));
		if(!$ip_address) $ip_address = ip2long('127.0.0.1');

		$data = array(
					'id' 			=> Cookie::get('ihYF23kouGY'),
					'ip_address' 	=> $ip_address,
					'user_agent'	=> Request::header('user_agent')
				);

		$token = Token::firstOrNew($data);
		$token->last_activity = time();
		$token->save();
	}
}