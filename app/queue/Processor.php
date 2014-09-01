<?php

class Processor {
	public function fire($job, $data)
	{
		return $job->getJobId();
	}
}