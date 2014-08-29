<?php

/**
 *
 * @author Avs
 */
interface CommissionRepositoryInterface {
    public function findAll($params);
    public function store($data);
    public function findById($id);
    public function update($id, $data);
    public function destroy($id);
    public function validate($data, $entity);
    public function instance($data);
}
