<?php

/**
 *
 * @author Das
 */
interface TruckRepositoryInterface {
    public function findAll($params);
    public function store($data);
    public function findById($id);
    public function update($id, $data);
    public function destroy($id);
    public function validate($data);
    public function instance($data);
}
