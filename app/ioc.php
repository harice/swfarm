<?php

/*
|--------------------------------------------------------------------------
| Application Inversion of Control
|--------------------------------------------------------------------------
|
| Class Bindings
|
*/

App::bind('UsersRepositoryInterface', 'UsersRepository');
App::bind('RolesRepositoryInterface', 'RolesRepository');
App::bind('PermissionRepositoryInterface', 'PermissionRepository');
App::bind('AuditRepositoryInterface', 'AuditRepository');
App::bind('ProductRepositoryInterface', 'ProductRepository');
App::bind('AccountRepositoryInterface', 'AccountRepository');
App::bind('ContactRepositoryInterface', 'ContactRepository');
App::bind('TransportScheduleRepositoryInterface', 'TransportScheduleRepository');
App::bind('WeightTicketRepositoryInterface', 'WeightTicketRepository');
App::bind('SalesOrderRepositoryInterface', 'SalesOrderRepository');
App::bind('OrderRepositoryInterface', 'OrderRepository');
App::bind('FarmLocationRepositoryInterface', 'FarmLocationRepository');
App::bind('StackRepositoryInterface', 'StackRepository');
App::bind('TrailerRepositoryInterface', 'TrailerRepository');
App::bind('ScaleRepositoryInterface', 'ScaleRepository');
App::bind('TruckRepositoryInterface', 'TruckRepository');
App::bind('FeeRepositoryInterface', 'FeeRepository');
App::bind('SettingsRepositoryInterface', 'SettingsRepository');
App::bind('DocumentRepositoryInterface', 'DocumentRepository');
App::bind('ContractRepositoryInterface', 'ContractRepository');
App::bind('ContractProductsRepositoryInterface', 'ContractProductsRepository');
App::bind('StorageLocationRepositoryInterface', 'StorageLocationRepository');
App::bind('InventoryRepositoryInterface', 'InventoryRepository');
App::bind('ReportRepositoryInterface', 'ReportRepository');
App::bind('CommissionRepositoryInterface', 'CommissionRepository');
App::bind('DownloadInterface', 'DownloadRepository');
App::bind('SyncInterface', 'SyncRepository');
App::bind('DashboardRepositoryInterface', 'DashboardRepository');
App::bind('PaymentRepositoryInterface', 'PaymentRepository');
App::bind('NotificationRepositoryInterface', 'NotificationRepository');
