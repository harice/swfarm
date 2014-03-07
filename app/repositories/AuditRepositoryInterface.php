<?php
 
interface AuditRepositoryInterface {
	public function findById($id);
    public function paginate($input);
	public function store($data);
	public function update($id, $data);
	public function destroy($id);
	public function validate($data, $rules);
	public function instance($data);
}