<?php

foreach(Config::get('constants.AUDIT') as $class) {
    $class::created(function($_data){
        
        if (Auth::check()) {
            $user = Auth::user()->lastname . ', ' . Auth::user()->firstname;
        } else {
            $user = 'Anonymous';
        }

        $data = array(
                'type' => get_class($_data),
                'user' => $user,
                'data_id' => $_data->id,
                'event' => Config::get('constants.AUDIT_CREATED'),
                'value' => serialize($_data)
            );

        $audit = new Audit($data);
        $audit->save();
    });
  
}

foreach(Config::get('constants.AUDIT') as $class) {
    $class::updated(function($_data){
        
        if (Auth::check()) {
            $user = Auth::user()->lastname . ', ' . Auth::user()->firstname;
        } else {
            $user = 'Anonymous';
        }

        $data = array(
                'type' => get_class($_data),
                'user' => $user,
                'data_id' => $_data->id,
                'event' => Config::get('constants.AUDIT_UPDATED'),
                'value' => serialize($_data)
            );
        
        $audit = new Audit($data);
        $audit->save();
    });
  
}

foreach(Config::get('constants.AUDIT') as $class) {
    $class::deleted(function($_data){
        
        if (Auth::check()) {
            $user = Auth::user()->lastname . ', ' . Auth::user()->firstname;
        } else {
            $user = 'Anonymous';
        }
        
        $data = array(
                'type' => get_class($_data),
                'user' => $user,
                'data_id' => $_data->id,
                'event' => Config::get('constants.AUDIT_DELETED'),
                'value' => serialize($_data)
            );

        $audit = new Audit($data);
        $audit->save();
    });
  
}

// Event::listen('eloquent.saving: Pivot', function($pivot){
//   var_dump($pivot); return false;
// });
