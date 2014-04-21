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
    Route::get('account/getAddress', 'APIv1\AccountController@getAddress');
	Route::get('account/getCustomerAccount', 'APIv1\AccountController@getCustomerAccount');
	Route::resource('account', 'APIv1\AccountController');

	Route::get('contact/search', 'APIv1\ContactController@search');
	Route::resource('contact', 'APIv1\ContactController');

	Route::get('po', 'APIv1\BidController@getPurchaseOrder');
	Route::put('po/addUnitPriceToBidProduct/{bidId}', 'APIv1\BidController@addUnitPriceToBidProduct');
	Route::put('po/addPickupDateToPurchaseOrder/{bidId}', 'APIv1\BidController@addPickupDateToPurchaseOrder');
	Route::post('po/createPurchaseOrder', 'APIv1\BidController@createPurchaseOrder');
	Route::put('po/cancelPurchaseOrder/{id}', 'APIv1\BidController@cancelPurchaseOrder');
	Route::put('po/closePurchaseOrder/{id}', 'APIv1\BidController@closePurchaseOrder');
	Route::get('po/search', 'APIv1\BidController@searchPurchaseOrder');

	Route::put('bid/cancelBid/{id}', 'APIv1\BidController@cancelBid');
	Route::get('bid/search', 'APIv1\BidController@search');
	Route::get('bid/getProducerAddress', 'APIv1\BidController@getProducerAddress');
	Route::get('bid/getProducerAccount', 'APIv1\BidController@getProducerAccount');
	Route::get('bid/getDestination', 'APIv1\BidController@getDestination');
	Route::resource('bid', 'APIv1\BidController');
    
    Route::get('weightticket/getWeightTicketOfSchedule', 'APIv1\WeightTicketController@getWeightTicketOfSchedule');
    Route::get('weightticket/getAllBidProductOnBid', 'APIv1\WeightTicketController@getAllBidProductOnBid');
    Route::get('weightticket/getAllScaleProviderAccount', 'APIv1\WeightTicketController@getAllScaleProviderAccount');
    Route::resource('weightticket', 'APIv1\WeightTicketController');


    Route::get('pickupschedule/getTruckingRate', 'APIv1\PickupScheduleController@getTruckingRate');
    Route::get('pickupschedule/getLoaderAccount', 'APIv1\PickupScheduleController@getLoaderAccount');
    Route::get('pickupschedule/getTruckerAccount', 'APIv1\PickupScheduleController@getTruckerAccount');
    Route::resource('pickupschedule', 'APIv1\PickupScheduleController');
    
    Route::resource('salesorder', 'APIv1\SalesOrderController');
    
});

/* API ROUTES without HTTP Basic */
Route::group(array('prefix' => 'apiv1'), function()
{
	Route::get('verifyAccount', 'APIv1\UsersController@verifyAccount');
});


Route::get('/', function(){
	return View::make('main')->withVersion(Config::get('Constants.VERSION',"1.0"));
});

