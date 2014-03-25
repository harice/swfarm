<?php

Event::listen('*', function($param) {
    var_dump(Event::firing());
    if(Event::firing() == 'sync.roles') {
      var_dump(Auth::user()->firstname);
    }
});

// foreach(Config::get('constants.AUDIT') as $class) {
  
//   $class::saving(function($_data){
//       $data = array(
//               'type' => get_class($_data),
//               'data_id' => $_data->id,
//               'event' => Config::get('constants.AUDIT_CREATED'),
//               'value' => serialize($_data)
//           );

//       var_dump($_data->roles()->get()->count());

//       $audit = new Audit($data);
//       $audit->save();
//   });
  

//   $class::saved(function($_data){
//       var_dump($_data->roles()->get()->count());
//   });
// }

// foreach(Config::get('constants.AUDIT') as $class) {
  
//   $class::created(function($_data){
//       $data = array(
//               'type' => get_class($_data),
//               'data_id' => $_data->id,
//               'event' => Config::get('constants.AUDIT_CREATED'),
//               'value' => serialize($_data)
//           );

//       $audit = new Audit($data);
//       $audit->save();
//   });
  
// }

// foreach(Config::get('constants.AUDIT') as $class) {
  
//   $class::updated(function($_data){
//       $data = array(
//               'type' => get_class($_data),
//               'data_id' => $_data->id,
//               'event' => Config::get('constants.AUDIT_UPDATED'),
//               'value' => serialize($_data)
//           );

//       $audit = new Audit($data);
//       $audit->save();
//   });
  
// }

// foreach(Config::get('constants.AUDIT') as $class) {
  
//   $class::deleted(function($_data){
//       $data = array(
//               'type' => get_class($_data),
//               'data_id' => $_data->id,
//               'event' => Config::get('constants.AUDIT_DELETED'),
//               'value' => serialize($_data)
//           );

//       $audit = new Audit($data);
//       $audit->save();
//   });
  
// }