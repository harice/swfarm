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
	public function generateSales()
	{
        $result = $this->report->generateSales(Input::all());
        return Response::json($result);
	}
    
    /**
     * Generate a Producer Statement Report
     * 
     * @return Reponse
     */
    public function generateProducerStatement()
    {
        $result = $this->report->generateProducerStatement(Input::all());
        return Response::json($result);
    }
}
