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


/* API ROUTES without HTTP Basic */
Route::group(array('prefix' => 'apiv1'), function()
{
    Route::get('verifyAccount', 'APIv1\UsersController@verifyAccount');
    Route::get('file/filesCleanUp', 'APIv1\FileController@filesCleanUp');
    Route::get('file/{data}', 'APIv1\FileController@show');
    
});

/* API ROUTES */
Route::group(array('prefix' => 'apiv1', 'before' => 'basic'), function()
{
    // Mail
    Route::put('weightticket/mailLoadingTicket/{id}', 'APIv1\WeightTicketController@mailLoadingTicket');
    Route::put('weightticket/mailWeightTicket/{id}', 'APIv1\WeightTicketController@mailWeightTicket');
    Route::put('weightticket/{id}/mail', 'APIv1\WeightTicketController@mailWeightTicket');
    
    // User
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

    // Route::get('account/{id}/contracts', 'APIv1\AccountController@getContracts');
    Route::get('account/getContracts/{id}', 'APIv1\AccountController@getContracts');
	Route::get('account/getProducerAndWarehouseAccount', 'APIv1\AccountController@getProducerAndWarehouseAccount');
    Route::get('account/trailer', 'APIv1\AccountController@getTrailerAccount');
    Route::get('account/scaler', 'APIv1\AccountController@getScalerAccount');
    Route::get('account/getScaleList', 'APIv1\AccountController@getScaleList');
    Route::get('account/loader', 'APIv1\AccountController@getLoaderAccount');
    Route::get('account/search', 'APIv1\AccountController@search');
	Route::get('account/getFormData', 'APIv1\AccountController@getFormData');
  	Route::get('account/getCitiesByState/{id}', 'APIv1\AccountController@getCitiesByState');
  	Route::get('account/getAccountsByName', 'APIv1\AccountController@getAccountsByName');
  	Route::get('account/getZipcodeUsingCity/{id}', 'APIv1\AccountController@getZipcodeUsingCity');
    Route::get('account/getAddress', 'APIv1\AccountController@getAddress');
	Route::get('account/getCustomerAccount', 'APIv1\AccountController@getCustomerAccount');
	Route::get('account/getProducerAccount', 'APIv1\AccountController@getProducerAccount');
    Route::get('account/truckerAccountTypes', 'APIv1\AccountController@getTruckerAccountTypes');
    Route::get('account/accountsByType', 'APIv1\AccountController@getAccountsByType');
    Route::get('account/contact', 'APIv1\AccountController@getAllContactOnAccount');
	Route::resource('account', 'APIv1\AccountController');

    Route::get('contact/hasRate/{id}', 'APIv1\ContactController@hasRate');
	Route::get('contact/search', 'APIv1\ContactController@search');
	Route::resource('contact', 'APIv1\ContactController');

	// Route::get('po', 'APIv1\BidController@getPurchaseOrder');
	// Route::put('po/addUnitPriceToBidProduct/{bidId}', 'APIv1\BidController@addUnitPriceToBidProduct');
	// Route::put('po/addPickupDateToPurchaseOrder/{bidId}', 'APIv1\BidController@addPickupDateToPurchaseOrder');	
	// Route::put('po/cancelPurchaseOrder/{id}', 'APIv1\BidController@cancelPurchaseOrder');
	// Route::put('po/closePurchaseOrder/{id}', 'APIv1\BidController@closePurchaseOrder');
	// Route::get('po/search', 'APIv1\BidController@searchPurchaseOrder');

    // Route::get('weightticket/getWeightTicketOfSchedule', 'APIv1\WeightTicketController@getWeightTicketOfSchedule');
    // Route::get('weightticket/getAllBidProductOnBid', 'APIv1\WeightTicketController@getAllBidProductOnBid');
    // Route::get('weightticket/getAllScaleProviderAccount', 'APIv1\WeightTicketController@getAllScaleProviderAccount');
    Route::put('weightticket/checkout/{id}', 'APIv1\WeightTicketController@checkoutWeightTicket');
    Route::get('weightticket/getAllWeightticketOfOrder', 'APIv1\WeightTicketController@getAllWeightticketOfOrder');
    Route::put('weightticket/closeWeightTicket/{id}', 'APIv1\WeightTicketController@closeWeightTicket');
    Route::get('weightticket/getScheduleProducts', 'APIv1\WeightTicketController@getScheduleProducts');
    Route::resource('weightticket', 'APIv1\WeightTicketController');

    //tranport schedule
    Route::put('transportschedule/closeSchedule/{id}', 'APIv1\TransportScheduleController@closeSchedule');
    Route::get('transportschedule/trailer', 'APIv1\TransportScheduleController@getTrailerList');
    Route::get('transportschedule/getTrailerList', 'APIv1\TransportScheduleController@getTrailerList');
    Route::get('transportschedule/getAllPickupSchedules', 'APIv1\TransportScheduleController@getAllPickupSchedules');
    Route::get('transportschedule/getAllDeliverySchedules', 'APIv1\TransportScheduleController@getAllDeliverySchedules');
    Route::get('transportschedule/getProductsOfOrder', 'APIv1\TransportScheduleController@getProductsOfOrder');
    Route::get('transportschedule/getTruckingRate', 'APIv1\TransportScheduleController@getTruckingRate');
    Route::get('transportschedule/{id}', 'APIv1\TransportScheduleController@getTransportSchedule');
    Route::resource('transportschedule', 'APIv1\TransportScheduleController');

    //Purchase Order
    // Route::post('purchaseorder/product/upload', 'APIv1\OrderController@uploadFileToProductOrder');
    Route::get('purchaseorder/checkInDropshipProducts', 'APIv1\OrderController@checkInDropshipOrderProducts');
    Route::get('purchaseorder/checkInProducerProducts', 'APIv1\OrderController@checkInProducerOrderProducts');
    Route::get('purchaseorder/getPurchaseOrderProductsForSalesOrder','APIv1\OrderController@getPurchaseOrderProductsForSalesOrder');
    Route::get('purchaseorder/getOrderWeightDetailsByStack', 'APIv1\OrderController@getOrderWeightDetailsByStack');
    Route::get('purchaseorder/getStatuses', 'APIv1\OrderController@getPOStatus');
    Route::get('purchaseorder/getDestinationList', 'APIv1\OrderController@getDestinationList');
    Route::get('purchaseorder/getCancellingReasonList', 'APIv1\OrderController@getPOCancellingReasonList');
    Route::put('purchaseorder/close/{id}', 'APIv1\OrderController@closeOrder');
    Route::put('purchaseorder/cancel/{id}', 'APIv1\OrderController@cancelOrder');
    Route::get('purchaseorder', 'APIv1\OrderController@getPurchaseOrders');
    Route::get('purchaseorder/search', 'APIv1\OrderController@getPurchaseOrders');
    Route::post('purchaseorder', 'APIv1\OrderController@addPurchaseOrder');
    Route::put('purchaseorder/{id}', 'APIv1\OrderController@updatePurchaseOrder');
    Route::get('purchaseorder/{id}', 'APIv1\OrderController@getPurchaseOrder');
    Route::delete('purchaseorder/{id}', 'APIv1\OrderController@destroy');
    // Route::resource('purchaseorder', 'APIv1\OrderController');

    //Sales Order
    Route::get('salesorder/getOrderWeightDetailsByStack', 'APIv1\OrderController@getOrderWeightDetailsByStack');
    Route::get('salesorder/getStatuses', 'APIv1\OrderController@getSOStatus');
    Route::get('salesorder/getPickupLocationList', 'APIv1\OrderController@getPickupLocationList');
    Route::get('salesorder/getCancellingReasonList', 'APIv1\OrderController@getSOCancellingReasonList');
    Route::get('salesorder/getNatureOfSaleList', 'APIv1\OrderController@getNatureOfSaleList');
    Route::put('salesorder/close/{id}', 'APIv1\OrderController@closeOrder');
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
    Route::get('stack/search', 'APIv1\StackController@search');
    Route::resource('stack', 'APIv1\StackController');
    
    // Scale
    Route::get('scale/search', 'APIv1\ScaleController@search');
    Route::resource('scale', 'APIv1\ScaleController');
    
    // Trailer
    Route::get('trailer/search', 'APIv1\TrailerController@search');
    Route::resource('trailer', 'APIv1\TrailerController');
    
    // Truck
    Route::get('truck/listByAccount', 'APIv1\TruckController@getTruckerListByAccount');
    Route::get('truck/search', 'APIv1\TruckController@search');
    Route::resource('truck', 'APIv1\TruckController');
    
    // Fee
    Route::resource('fee', 'APIv1\FeeController');

    // settings
    Route::get('settings/getTransportSettings', 'APIv1\SettingsController@getTransportSettings');
    Route::put('settings', 'APIv1\SettingsController@updateSettings');
    Route::resource('settings', 'APIv1\SettingsController');

    // File
    Route::resource('document', 'APIv1\DocumentController');
    
    // Contract
    Route::put('contract/close/{id}', 'APIv1\ContractController@closeContract');
    Route::put('contract/open/{id}', 'APIv1\ContractController@openContract');
    
    Route::get('contract/getProducts/{id}', 'APIv1\ContractController@products');
    Route::get('contract/getSalesOrderByProduct/{id}', 'APIv1\ContractController@salesorder');
    
    Route::get('contract/{id}/weighttickets', 'APIv1\ContractController@weighttickets');
    Route::get('contract/{id}/products', 'APIv1\ContractController@products');
    Route::get('contract/{id}/salesorders', 'APIv1\ContractController@salesorder');
    Route::get('contract/search', 'APIv1\ContractController@search');
    Route::resource('contract', 'APIv1\ContractController');

    // Storage location
    Route::get('storagelocation/warehouse', 'APIv1\StorageLocationController@getStorageLocationOfWarehouse');
    Route::get('storagelocation/getByAccount/{id}', 'APIv1\StorageLocationController@getStorageLocationByAccount');
    Route::get('storagelocation/locationlist', 'APIv1\StorageLocationController@locationList');
    Route::get('storagelocation/search', 'APIv1\StorageLocationController@search');
    Route::resource('storagelocation', 'APIv1\StorageLocationController');

    // Inventory
    Route::get('inventory/summaryByStack', 'APIv1\InventoryController@getInventorySummaryByStack');
    Route::get('inventory/stackListByProduct', 'APIv1\InventoryController@getStackListByProduct');
    Route::get('inventory/stacklist', 'APIv1\InventoryController@stackList');
    Route::get('inventory/transactiontype', 'APIv1\InventoryController@transactionType');
    Route::post('inventory/purchaseorder', 'APIv1\InventoryController@store');
    Route::resource('inventory', 'APIv1\InventoryController');
    
    // Reports
    Route::get('report/inventoryPerLocation', 'APIv1\ReportController@inventoryReportPerLocation');
    Route::get('report/sales', 'APIv1\ReportController@generateSales');
    Route::get('report/producer-statement', 'APIv1\ReportController@generateProducerStatement');
});

Route::group(array('before' => 'auth.session'),function(){
    Route::resource('file','FileController', array('only' => array('index')));
});

Route::get('/', function(){ return View::make('main')->withVersion(Config::get('Constants.VERSION',"1.0")); });
Route::get('/{dump}', function(){ return View::make('errors/404'); });
