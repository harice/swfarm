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
	Route::resource('users', 'APIv1\UsersController');	
	Route::resource('roles', 'APIv1\RolesController');
    Route::resource('products', 'APIv1\ProductsController');
    Route::resource('dblog', 'APIv1\DblogController');
});


Route::get('/', function(){
	return View::make('main');
});

