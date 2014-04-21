<?php

interface SalesOrderRepositoryInterface {
	public function findAll();
    public function findById($id);
    public function store($data);
    public function update($id, $data);
    public function destroy($id);
    public function validate($data, $entity);
    public function getOrigin();
    public function getNatureOfSale();
}
