<?php
 
interface TransportScheduleRepositoryInterface {
	public function getSchedule($id, $scheduleType);
	public function paginate($params);
	public function addOrUpdateTransportSchedule($data, $pickupScheduleId);
	public function deleteTransportSchedule($id);
	public function validate($data, $rules);
	public function instance();
}