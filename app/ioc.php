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
