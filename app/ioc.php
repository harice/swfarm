<?php

/*
|--------------------------------------------------------------------------
| Application Inversion of Control
|--------------------------------------------------------------------------
|
| Class Bindings
|
*/

App::bind('RolesRepositoryInterface', 'RolesRepository');

App::bind('UsersRepositoryInterface', 'UsersRepository');