<?php

/**
 *
 * @author Das
 */
interface ContractProductsRepositoryInterface {
    public function findAll($params);
    public function search($params);
    public function store($contract_id, $data);
    public function findById($contract_id, $product_id);
    public function update($contract_id, $data);
    public function destroy($id);
    public function validate($data);
    public function instance($data);
}
