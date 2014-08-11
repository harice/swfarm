<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use ReportRepositoryInterface;
use Input;

/**
 * Description of ReportController
 *
 * @author Das
 */

class ReportController extends BaseController {
    
    public function __construct(ReportRepositoryInterface $report)
    {
        $this->report = $report;
    }

	/**
	 * Generate a Customer Sales Report
	 *
	 * @return Response
	 */
	public function getSales()
	{
        $result = $this->report->getSales(Input::all());
        return Response::json($result);
	}
}
