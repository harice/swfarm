<?php

/**
 *
 * @author Avs
 */
interface InventoryRepositoryInterface {
    public function findAll($params);
    public function store($data);
    public function findById($id);
    public function update($id, $data);
    public function destroy($id);
    public function validate($data, $entity);
    public function instance($data);
}
