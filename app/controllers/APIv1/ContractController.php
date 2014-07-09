<?php

namespace APIv1;

use BaseController;
use Illuminate\Support\Facades\Response;
use ContractRepositoryInterface;
use Input;

class ContractController extends BaseController {

	public function __construct(ContractRepositoryInterface $repo)
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
	 * Search for a specfic record.
	 *
	 * @return Response
	 */
	public function search()
	{
        $result = $this->repo->search( Input::all() );
        return Response::json($result);
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		$response = $this->repo->store(Input::all());
        return Response::json($response);
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
        return Response::json($response);
	}
    
    /**
     * Update status
     * 
     * @param type $id
     * @return type
     */
    public function closeContract($id)
    {
        $data['status_id'] = 2;
        $response = $this->repo->updateStatus($id, $data);
        return Response::json($response);
    }
    
    /**
     * Update status
     * 
     * @param type $id
     * @return type
     */
    public function openContract($id)
    {
        $data['status_id'] = 1;
        $response = $this->repo->updateStatus($id, $data);
        return Response::json($response);
    }
    
    public function salesorder($id)
    {
//        $param['mock'] = true;
//        
        $param = Input::all();
        if(false) {
            $json = '[
                        {
                            "product_id": 1,
                            "product_name": "Alfalfa",
                            "total_tons": "1,900.0000",
                            "delivered_tons": "1,125.0000",
                            "remaining_tons": "1,775.0000",
                            "salesorders": [
                                {
                                    "id": 24,
                                    "order_number": "S20140630-0004",
                                    "contract_id": 5,
                                    "stacknumber": "COW94934949",
                                    "tons": "50.0000",
                                    "bales": 5,
                                    "product_id": 1,
                                    "status_id": 1,
                                    "status": {
                                        "id": 1,
                                        "name": "Open",
                                        "class": "success"
                                    },
                                    "delivered_tons": "1,000.0000"
                                },
                                {
                                    "id": 31,
                                    "order_number": "S20140701-0001",
                                    "contract_id": 5,
                                    "stacknumber": "S2",
                                    "tons": "50.0000",
                                    "bales": 5,
                                    "product_id": 1,
                                    "status_id": 1,
                                    "status": {
                                        "id": 1,
                                        "name": "Open",
                                        "class": "success"
                                    },
                                    "delivered_tons": "1,000.0000"
                                }
                            ]
                        },
                        {
                            "product_id": 2,
                            "product_name": "Bermuda",
                            "total_tons": "1,900.0000",
                            "delivered_tons": "1,125.0000",
                            "remaining_tons": "1,775.0000",
                            "salesorders": [
                                {
                                    "id": 24,
                                    "order_number": "S20140630-0004",
                                    "contract_id": 5,
                                    "stacknumber": "BER82838434",
                                    "tons": "50.0000",
                                    "bales": 5,
                                    "product_id": 2,
                                    "status_id": 1,
                                    "status": {
                                        "id": 1,
                                        "name": "Open",
                                        "class": "success"
                                    },
                                    "delivered_tons": "1,000.0000"
                                },
                                {
                                    "id": 31,
                                    "order_number": "S20140701-0001",
                                    "contract_id": 5,
                                    "stacknumber": "S3",
                                    "tons": "50.0000",
                                    "bales": 5,
                                    "product_id": 2,
                                    "status_id": 1,
                                    "status": {
                                        "id": 1,
                                        "name": "Open",
                                        "class": "success"
                                    },
                                    "delivered_tons": "1,000.0000"
                                }
                            ]
                        },
                        {
                            "product_id": 8,
                            "product_name": "Sudan",
                            "total_tons": "0.0000",
                            "delivered_tons": "0.0000",
                            "remaining_tons": "0.0000",
                            "salesorders": []
                        }
                    ]';
            
            return Response::json(json_decode($json, true));
        }
        
        $result = $this->repo->salesorder($id);
        return Response::json($result);
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
    
    /**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function products($id)
	{
        $response = $this->repo->products($id);
        return Response::json($response);
	}
    
    /**
	 * Get Weight Tickets of this Contract.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function weighttickets($id)
	{
        $response = $this->repo->weighttickets($id);
        return Response::json($response);
	}

}
