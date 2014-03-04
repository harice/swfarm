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

App::bind('ProductsRepositoryInterface', 'ProductsRepository');

App::bind('WatchdogRepositoryInterface', 'WatchdogRepository');