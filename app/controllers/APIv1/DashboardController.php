<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use DashboardRepositoryInterface;
use Input;

/**
 * Description of TruckController
 *
 * @author Avs
 */

class DashboardController extends BaseController {
    
    public function __construct(DashboardRepositoryInterface $repo)
    {
        $this->repo = $repo;
    }

    public function main(){
    	$result = $this->repo->dashboard(Input::all());
    	return Response::json($result);
    }

    public function purchaseInTons(){
    	$result = $this->repo->purchaseInTons(Input::all());
    	return Response::json($result);
    }

    public function salesInTons(){
    	$result = $this->repo->salesInTons(Input::all());
    	return Response::json($result);
    }

    public function purchaseInDollarValues(){
    	$result = $this->repo->purchaseInDollarValues(Input::all());
    	return Response::json($result);
    }

    public function salesInDollarValues(){
    	$result = $this->repo->salesInDollarValues(Input::all());
    	return Response::json($result);
    }

    public function reservedDeliveredVsBalanceOrderPerCustomerAccount(){
        $result = $this->repo->reservedDeliveredVsBalanceOrderPerCustomerAccount(Input::all());
        return Response::json($result);
    }

    public function inventoryProductOnHand(){
        $result = $this->repo->inventoryProductOnHand(Input::all());
        return Response::json($result);
    }


}
