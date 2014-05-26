<?php

/**
 *
 * @author Das
 */
interface ScaleRepositoryInterface {
    public function findAll($params);
    public function search($params);
    public function store($data);
    public function findById($id);
    public function update($id, $data);
    public function destroy($id);
    public function validate($data);
    public function instance($data);
}
