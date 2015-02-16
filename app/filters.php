<?php

/*
|--------------------------------------------------------------------------
| Application & Route Filters
|--------------------------------------------------------------------------
|
| Below you will find the "before" and "after" events for the application
| which may be used to do any work before or after a request into your
| application. Here you may also register your custom route filters.
|
*/

Common::globalXssClean(); //for XSS cleaning of forms

App::before(function($request)
{
	//
});


App::after(function($request, $response)
{
	//
});

App::error( function(Symfony\Component\HttpKernel\Exception\HttpException $e, $code)
{
	$headers = $e->getHeaders();
 
	switch($code)
	{
		case 401:
		  $default_message = 'Unauthorized';
		  $headers['WWW-Authenticate'] = 'Basic realm="CRM REST API"';
		break;

		case 403:
		  $default_message = 'Insufficient privileges to perform this action';
		break;

		case 404:
		  $default_message = 'The requested resource was not found';
		break;

		default:
		  $default_message = 'An error was encountered';
	}

	return Response::json(array(
		'error' => $e->getMessage() ?: $default_message
	), $code, $headers);
});

App::error(function(PermissionException $e, $code)
{
	return Response::json($e->getMessage(), $e->getCode());
});

App::error(function(ValidationException $e, $code)
{
	return Response::json($e->getMessages(), $e->getCode());
});

App::error(function(NotFoundException $e)
{
	return Response::json($e->getMessage(), $e->getCode());
});

/*
|--------------------------------------------------------------------------
| Authentication Filters
|--------------------------------------------------------------------------
|
| The following filters are used to verify that the user of the current
| session is logged into this application. The "basic" filter easily
| integrates HTTP Basic authentication for quick, simple checking.
|
*/

Route::filter('auth', function()
{
	if (Auth::guest()) return Redirect::guest('login');
});


Route::filter('auth.basic', function()
{
	return Auth::basic();
});

Route::filter('auth.session', function()
{
	if(Request::ajax()) return App::abort(501,'Not implemented');

	if(!Cookie::get('ihYF23kouGY')) return Redirect::to('404')->withPage('file');

	// if(!Tokenizer::validate()) return Redirect::to('404')->withPage('file');

	if(!Input::get('q')) return Redirect::to('404')->withPage('file');
});

Route::filter('basic', function()
{
	$auth = Auth::once(
				array(  'email' => Request::header('php-auth-user'), 
						'password' => Request::header('php-auth-pw'),
						'status' => true
					)
				);
	if(!$auth) return App::abort(403,'Unauthorized',['WWW-Authenticate' => 'Basic']);
});

Route::filter('tokenizer',function(){ Tokenizer::store(); });

/*
|--------------------------------------------------------------------------
| Guest Filter
|--------------------------------------------------------------------------
|
| The "guest" filter is the counterpart of the authentication filters as
| it simply checks that the current user is not logged in. A redirect
| response will be issued if they are, which you may freely change.
|
*/

Route::filter('guest', function()
{
	if (Auth::check()) return Redirect::to('/');
});

/*
|--------------------------------------------------------------------------
| CSRF Protection Filter
|--------------------------------------------------------------------------
|
| The CSRF filter is responsible for protecting your application against
| cross-site request forgery attacks. If this special token in a user
| session does not match the one given in this request, we'll bail.
|
*/

Route::filter('csrf', function()
{
	if (Session::token() != Input::get('_token'))
	{
		throw new Illuminate\Session\TokenMismatchException;
	}
});