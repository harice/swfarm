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
App::bind('BidRepositoryInterface', 'BidRepository');
App::bind('WeightInfoRepositoryInterface', 'WeightInfoRepository');
App::bind('PickupScheduleRepositoryInterface', 'PickupScheduleRepository');
App::bind('WeightTicketRepositoryInterface', 'WeightTicketRepository');

