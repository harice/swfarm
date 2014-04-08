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
Route::group(array('prefix' => 'apiv1', 'before' => 'basic'), function()
{
	Route::get('users/search', 'APIv1\UsersController@search');
	Route::get('users/auth', 'APIv1\UsersController@auth');
	Route::put('users/updateprofile/{id}', 'APIv1\UsersController@updateProfile');
	Route::resource('users', 'APIv1\UsersController');
	
	Route::get('roles/all', 'APIv1\RolesController@all');
	Route::resource('roles', 'APIv1\RolesController');

	Route::get('permission/getAllPermissionCategoryType', 'APIv1\PermissionController@getAllPermissionCategoryType');
	Route::resource('permission', 'APIv1\PermissionController');

  	Route::resource('audit', 'APIv1\AuditController');

    Route::get('product/search', 'APIv1\ProductController@search');
    Route::resource('product', 'APIv1\ProductController');

    Route::get('account/search', 'APIv1\AccountController@search');
	Route::get('account/getFormData', 'APIv1\AccountController@getFormData');
  	Route::get('account/getCitiesByState/{id}', 'APIv1\AccountController@getCitiesByState');
  	Route::get('account/getAccountsByName', 'APIv1\AccountController@getAccountsByName');
  	Route::get('account/getZipcodeUsingCity/{id}', 'APIv1\AccountController@getZipcodeUsingCity');
	Route::resource('account', 'APIv1\AccountController');

	Route::get('contact/search', 'APIv1\ContactController@search');
	Route::resource('contact', 'APIv1\ContactController');

	Route::get('bid/getPurchaseOrder', 'APIv1\BidController@getPurchaseOrder');
	Route::post('bid/addUnitPriceToBidProduct/{bidId}', 'APIv1\BidController@addUnitPriceToBidProduct');
	Route::post('bid/addPickupDateToPurchaseOrder/{bidId}', 'APIv1\BidController@addPickupDateToPurchaseOrder');
	Route::post('bid/createPurchaseOrder', 'APIv1\BidController@createPurchaseOrder');
	Route::post('bid/cancelPurchaseOrder/{id}', 'APIv1\BidController@cancelPurchaseOrder');
	Route::get('bid/search', 'APIv1\BidController@search');
	Route::get('bid/getProducerAddress', 'APIv1\BidController@getProducerAddress');
	Route::get('bid/getProducerAccount', 'APIv1\BidController@getProducerAccount');
	Route::get('bid/getDestination', 'APIv1\BidController@getDestination');
	Route::resource('bid', 'APIv1\BidController');
    
    Route::resource('weightticket', 'APIv1\WeightTicketController');
});

/* API ROUTES without HTTP Basic */
Route::group(array('prefix' => 'apiv1'), function()
{
	Route::get('verifyAccount', 'APIv1\UsersController@verifyAccount');
});


Route::get('/', function(){
	return View::make('main');
});

