<?php
 
interface UsersRepositoryInterface {
	public function findById($id);
	public function findAll();
	public function paginate($limit = null);
	public function store($data);
	public function update($id, $data);
	public function destroy($id);
	public function validate($data, $rules);
	public function instance();
}