<?php
 
interface PermissionRepositoryInterface {
	public function update($id, $data);
	public function validate($data, $rules);
	public function instance();
	public function getAllPermissionCategoryType();
	public function getPermissionByRoleId($id);
	public function getAllRoleWithPermission();
}