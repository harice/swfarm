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
        $result = $this->report->generateCustomerSales($id, Input::all());
        return Response::json($result);
	}

    /**
     * Generate a Producer Statement Report
     *
     * @return Reponse
     */
    public function generateProducerStatement($id)
    {
        $result = $this->report->generateProducerStatement($id, Input::all());
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

    /**
     * Generate Gross Profit Report
     *
     * @return Response
     */
    public function generateGrossProfit()
    {
        $result = $this->report->generateGrossProfit(Input::all());
        return Response::json($result);
    }

    /**
     * Generate Inventory Report
     *
     * @return Response
     */
    public function inventoryReportPerLocation(){
        $response = $this->report->inventoryReportPerLocation( Input::all() );
        return Response::json($response);
    }

    /**
     * Generate Commission Report
     *
     * @return Response
     */
    public function generateCommissionReport($id)
    {
        $result = $this->report->generateCommissionReport($id, Input::all());
        return Response::json($result);
    }

}
