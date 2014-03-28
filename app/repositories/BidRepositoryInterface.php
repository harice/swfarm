<?php
 
interface BidRepositoryInterface {
	public function findAll();
	public function findById($id);
	public function paginate($params);
	public function store($data);
	public function update($id, $data);
	public function destroy($id);
	public function search($_search);
	public function validate($data, $rules);
	public function instance();
	
}