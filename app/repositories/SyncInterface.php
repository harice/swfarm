<?php

interface SyncInterface {
	public function addOrder($params);
    public function syncing($type,$params);
}