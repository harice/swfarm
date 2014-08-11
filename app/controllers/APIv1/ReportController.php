<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use ProductRepositoryInterface;
use Input;

/**
 * Description of ReportController
 *
 * @author Das
 */

class ReportController extends BaseController {
    
    public function __construct(
        ProductRepositoryInterface $product
    ) {
        $this->product = $product;
    }

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function getSales()
	{
        $result = $this->product->findAll( Input::all() );
        return Response::json($result);
	}
}
