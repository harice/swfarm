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

App::bind('ProductsRepositoryInterface', 'ProductsRepository');

App::bind('WatchdogRepositoryInterface', 'WatchdogRepository');

App::bind('AuditRepositoryInterface', 'AuditRepository');
