<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use InventoryRepositoryInterface;
use Input;

/**
 * Description of InventoryController
 *
 * @author Avs
 */

class InventoryController extends BaseController {
    
    public function __construct(InventoryRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        $result = $this->repo->findAll( Input::all() );
        return Response::json($result);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		$response = $this->repo->store( Input::all() );
	    if(is_array($response)){
	        if(isset($response['error']) && $response['error'] == true){
	            return Response::json($response, 500);
	        } else {
	            return Response::json($response);
	        }
	    } else {
	    	return Response::json($response);
	    }
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
        $model = $this->repo->findById($id);
        return Response::json($model);
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		$response = $this->repo->update($id, Input::all());
        return $response;
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		$response = $this->repo->destroy($id);
        return Response::json($response);
	}

	public function transactionType(){
		$response = $this->repo->getInventoryTransactionType();
        return Response::json($response);
	}

	public function stackList(){
		$response = $this->repo->getStackList(Input::get('productId'), Input::get('accountId'));
        return Response::json($response);
	}

	public function getStackListByProduct(){
		$response = $this->repo->getStackListByProduct( Input::all() );
        return Response::json($response);
	}

	public function getInventorySummaryByStack(){
		$response = $this->repo->getInventorySummaryByStack( Input::all() );
        return Response::json($response);
	}

	public function getProductsOfOrder(){
		$model = $this->repo->getProductsOfOrder(Input::get('orderId'));
        return Response::json($model);
	}

	/*public function inventoryReportPerLocation(){
		$response = $this->repo->inventoryReportPerLocation( Input::get('storagelocationId') );
        return Response::json($response);
	}*/

}
