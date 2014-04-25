<?php

interface OrderRepositoryInterface {
	public function getAllOrders($params, $orderType);
    public function getOrder($id, $orderType);
    public function addOrder($data);
    public function updateOrder($id, $data);
    public function deleteOrder($id);
    public function validate($data, $entity);
    public function getNatureOfSaleList();
    public function close($id);
    public function cancel($id);
}
