<?php

/*
|--------------------------------------------------------------------------
| Application Routes
|--------------------------------------------------------------------------
|
| Here is where you can register all of the routes for an application.
| It's a breeze. Simply tell Laravel the URIs it should respond to
| and give it the Closure to execute when that URI is requested.
|
*/

/* API ROUTES */
Route::group(array('prefix' => 'apiv1'), function()
{
	Route::resource('roles', 'APIv1\RolesController');
	Route::resource('roles/store', 'APIv1\RolesController@create');

	Route::resource('users', 'APIv1\UsersController');
});


Route::get('/', function(){
	return View::make('main');
});

Route::get('roles/add','RolesController@create');
