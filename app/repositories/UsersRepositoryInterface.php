<?php
 
interface UsersRepositoryInterface {
	public function findById($id);
	public function findAll();
	public function paginate($perPage, $offset, $sortby, $orderby);
	public function store($data);
	public function update($id, $data);
	public function destroy($id);
	public function validate($data, $rules);
	public function auth();
	public function instance();
}