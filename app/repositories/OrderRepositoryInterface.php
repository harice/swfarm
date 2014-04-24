<?php

interface OrderRepositoryInterface {
	public function findAll($params);
    public function findById($id);
    public function addOrder($data);
    public function updateOrder($id, $data);
    public function destroy($id);
    public function validate($data, $entity);
    public function getOrigin();
    public function getNatureOfSale();
    public function close($id);
    public function cancel($id);
}
