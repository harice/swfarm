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
	public function generateSales($id)
	{
        $result = $this->report->generateSales($id, Input::all());
        return Response::json($result);
	}
    
    /**
     * Generate a Producer Statement Report
     * 
     * @return Reponse
     */
    public function generateProducerStatement($id)
    {
        $result = $this->report->_generateProducerStatement($id, Input::all());
        return Response::json($result);
    }
    
    /**
     * Generate an Operator Pay Report
     * 
     * @return type
     */
    public function generateOperatorPay($id)
    {
        $result = $this->report->generateOperatorPay($id, Input::all());
        return Response::json($result);
    }
    
    /**
     * Generate driver's pay
     * 
     * @param int $id Contact Id
     * @param array $params
     * @return mixed
     */
    public function generateDriverPay($id)
    {
        $result = $this->report->generateDriverPay($id, Input::all());
        return Response::json($result);
    }
    
    /**
     * Generate a Trucking Statement Report
     * 
     * @param int $id
     * @return Response
     */
    public function generateTruckingStatement($id)
    {
        $result = $this->report->generateTruckingStatement($id, Input::all());
        return Response::json($result);
    }
}
