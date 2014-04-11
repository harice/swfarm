<?php
 
interface AccountRepositoryInterface {
	public function findAll();
	public function findById($id);
	public function paginate($params);
	public function store($data);
	public function update($id, $data);
	public function destroy($id);
	public function search($_search);
	public function validate($data, $rules);
	public function instance();
	public function getCitiesByState($stateId);
	public function getFormData();
	public function getZipcodeUsingCity($city);
	public function getAccountsByName($name);
}