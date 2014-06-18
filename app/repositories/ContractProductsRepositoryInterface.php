<?php

/**
 *
 * @author Das
 */
interface ContractProductsRepositoryInterface {
    public function findAll($params);
    public function search($params);
    public function store($contract_id, $data);
    public function findById($id);
    public function update($id, $data);
    public function destroy($id);
    public function validate($data);
    public function instance($data);
}
