<?php

Roles::created(function($roles){
    $value = serialize($roles->toJson());
    DB::table('audit')->insert(
        array(
            'type' => Config::get('constants.AUDIT_ROLE'),
            'event' => Config::get('constants.AUDIT_ROLE_CREATED'),
            'value' => $value
        )
    );
});

Roles::updated(function($roles){
    $value = serialize($roles->toJson());
    DB::table('audit')->insert(
        array(
            'type' => Config::get('constants.AUDIT_ROLE'),
            'event' => Config::get('constants.AUDIT_ROLE_UPDATED'),
            'value' => $value
        )
    );
});

Roles::deleted(function($roles){
    $value = serialize($roles->toJson());
    DB::table('audit')->insert(
        array(
            'type' => Config::get('constants.AUDIT_ROLE'),
            'event' => Config::get('constants.AUDIT_ROLE_DELETED'),
            'value' => $value
        )
    );
});