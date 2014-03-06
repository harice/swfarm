<?php
 
interface PermissionRepositoryInterface {
	public function store($data);
	public function validate($data, $rules);
	public function instance();
	public function getAllPermissionCategoryType();
	public function getPermissionByRoleId($id);
	public function getAllRoleWithPermission();
}