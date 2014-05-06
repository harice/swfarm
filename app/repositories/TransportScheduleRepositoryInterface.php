<?php
 
interface TransportScheduleRepositoryInterface {
	public function getSchedule($id);
	public function getAllTransportSchedules($params, $scheduleType);
	public function addOrUpdateTransportSchedule($data, $pickupScheduleId);
	public function deleteTransportSchedule($id);
	public function validate($data, $rules);
	public function instance();
}