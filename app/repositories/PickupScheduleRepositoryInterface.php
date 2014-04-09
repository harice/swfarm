<?php
 
interface PickupScheduleRepositoryInterface {
	public function findById($id);
	public function paginate($params);
	public function addOrUpdatePickupSchedule($data, $pickupScheduleId);
	public function deletePickupSchedule($id);
	public function validate($data, $rules);
	public function instance();
}