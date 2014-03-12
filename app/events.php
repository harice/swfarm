<?php

foreach(Config::get('constants.AUDIT') as $class) {
  
  $class::created(function($_data){
      $data = array(
              'type' => get_class($_data),
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
      $data = array(
              'type' => get_class($_data),
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
      $data = array(
              'type' => get_class($_data),
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