<?php
 
class WatchdogRepository implements WatchdogRepositoryInterface {

  public function findById($id){

  }

  public function findAll(){
    return Watchdog::all();
  }

  public function paginate($perPage, $offset) {

  }

  public function store($data){

  }

  public function update($id, $data){

  }

  public function destroy($id){

  }
  
  public function validate($data, $rules){

  }


  public function instance($data = array())
  {
    return new Watchdog($data);
  }
}