<?php
 
interface AuditRepositoryInterface {
	public function findById($id);
  public function paginate($perPage, $offset, $sortby, $orderby, $type, $data_id);
	public function store($data);
	public function update($id, $data);
	public function destroy($id);
	public function validate($data, $rules);
	public function instance($data);
}