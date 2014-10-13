<?php

namespace APIv1;

use BaseController;
use SyncInterface;

class SyncController extends BaseController {

	public function __construct(SyncInterface $sync)
	{
		$this->sync = $sync;
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  string  $type
	 * @return Response
	 */
	public function show($type)
	{
		return $this->sync->syncing($type);
	}


}
