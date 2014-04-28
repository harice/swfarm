<?php

interface OrderRepositoryInterface {
	public function getAllOrders($params, $orderType);
    public function getOrder($id, $orderType);
    public function addOrder($data, $orderType);
    public function updateOrder($id, $data, $orderType);
    public function deleteOrder($id);
    public function validate($data, $entity);
    public function getNatureOfSaleList();
    public function close($id);
    public function cancelOrder($id);
}
