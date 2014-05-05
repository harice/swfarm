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
	Route::get('account/getProducerAccount', 'APIv1\AccountController@getProducerAccount');
	Route::resource('account', 'APIv1\AccountController');

	Route::get('contact/search', 'APIv1\ContactController@search');
	Route::resource('contact', 'APIv1\ContactController');

	Route::get('po', 'APIv1\BidController@getPurchaseOrder');
	Route::put('po/addUnitPriceToBidProduct/{bidId}', 'APIv1\BidController@addUnitPriceToBidProduct');
	Route::put('po/addPickupDateToPurchaseOrder/{bidId}', 'APIv1\BidController@addPickupDateToPurchaseOrder');	
	Route::put('po/cancelPurchaseOrder/{id}', 'APIv1\BidController@cancelPurchaseOrder');
	Route::put('po/closePurchaseOrder/{id}', 'APIv1\BidController@closePurchaseOrder');
	Route::get('po/search', 'APIv1\BidController@searchPurchaseOrder');

	// Route::put('bid/cancelBid/{id}', 'APIv1\BidController@cancelBid');
	// Route::get('bid/search', 'APIv1\BidController@search');
	// Route::get('bid/getProducerAddress', 'APIv1\BidController@getProducerAddress');
	// Route::get('bid/getProducerAccount', 'APIv1\BidController@getProducerAccount');
	// Route::get('bid/getDestination', 'APIv1\BidController@getDestination');
	// Route::resource('bid', 'APIv1\BidController');
    
    Route::get('weightticket/getWeightTicketOfSchedule', 'APIv1\WeightTicketController@getWeightTicketOfSchedule');
    Route::get('weightticket/getAllBidProductOnBid', 'APIv1\WeightTicketController@getAllBidProductOnBid');
    Route::get('weightticket/getAllScaleProviderAccount', 'APIv1\WeightTicketController@getAllScaleProviderAccount');
    Route::resource('weightticket', 'APIv1\WeightTicketController');


    Route::get('transportschedule/getTruckingRate', 'APIv1\TransportScheduleController@getTruckingRate');
    Route::get('transportschedule/getLoaderAccount', 'APIv1\TransportScheduleController@getLoaderAccount');
    Route::get('transportschedule/getTruckerAccount', 'APIv1\TransportScheduleController@getTruckerAccount');
	Route::resource('transportschedule', 'APIv1\TransportScheduleController');
	Route::get('transportschedule/getAllPickupSchedules', 'APIv1\TransportScheduleController@getAllPickupSchedules');
    Route::get('transportschedule/getPickupSchedule/{id}', 'APIv1\TransportScheduleController@getPickupSchedule');
	Route::resource('transportschedule', 'APIv1\TransportScheduleController');
	
    //Purchase Order
    Route::get('purchaseorder/getStatuses', 'APIv1\OrderController@getPOStatus');
    Route::get('purchaseorder/getDestinationList', 'APIv1\OrderController@getDestinationList');
    Route::put('purchaseorder/cancel/{id}', 'APIv1\OrderController@cancelOrder');
    Route::get('purchaseorder', 'APIv1\OrderController@getPurchaseOrders');
    Route::get('purchaseorder/search', 'APIv1\OrderController@getPurchaseOrders');
    Route::post('purchaseorder', 'APIv1\OrderController@addPurchaseOrder');
    Route::put('purchaseorder/{id}', 'APIv1\OrderController@updatePurchaseOrder');
    Route::get('purchaseorder/{id}', 'APIv1\OrderController@getPurchaseOrder');
    
    Route::delete('purchaseorder/{id}', 'APIv1\OrderController@destroy');
    // Route::resource('purchaseorder', 'APIv1\OrderController');

    //Sales Order

    Route::get('salesorder/getStatuses', 'APIv1\OrderController@getSOStatus');
    Route::get('salesorder/getPickupLocationList', 'APIv1\OrderController@getPickupLocationList');
    Route::get('salesorder/getNatureOfSaleList', 'APIv1\OrderController@getNatureOfSaleList');
    Route::put('salesorder/cancel/{id}', 'APIv1\OrderController@cancelOrder');
    Route::get('salesorder/search', 'APIv1\OrderController@getSalesOrders');
    Route::get('salesorder/{id}', 'APIv1\OrderController@getSalesOrder');
    Route::get('salesorder', 'APIv1\OrderController@getSalesOrders');
    
    Route::post('salesorder', 'APIv1\OrderController@addSalesOrder');
    Route::put('salesorder/{id}', 'APIv1\OrderController@updateSalesOrder');
    Route::delete('salesorder/{id}', 'APIv1\OrderController@destroy');

    // Farm Location
    Route::resource('farmlocation', 'APIv1\FarmLocationController');
    
    // Stack
    Route::resource('stack', 'APIv1\StackController');
    
});

/* API ROUTES without HTTP Basic */
Route::group(array('prefix' => 'apiv1'), function()
{
	Route::get('verifyAccount', 'APIv1\UsersController@verifyAccount');
});


Route::get('/', function(){
	return View::make('main')->withVersion(Config::get('Constants.VERSION',"1.0"));
});

