<?php

namespace APIv1;

use BaseController;
use ProductsRepositoryInterface;
use View;
use Input;

class ProductsController extends BaseController {

	public function __construct(ProductsRepositoryInterface $products){
		$this->products = $products;
	}

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{	
		return $this->products->findAll();
    
		// return Response::json(array(
		// 	'error' => false,
		// 	'users' => $this->products->findAll())
		// );
    //return View::make('users.index');
	}

	/**
	 * Store a newly created resource in storage.
	 *
	 * @return Response
	 */
	public function store()
	{
		return $this->products->store( Input::all() );
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
        return $this->products->findById($id);
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
        return View::make('products.edit');
	}

	/**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function update($id)
	{
		return $this->products->update($id, Input::all());
	}

	/**
	 * Remove the specified resource from storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function destroy($id)
	{
		return $this->products->destroy($id);
	}

	public function paginate($perPage = 2, $offest = 0){
		return $this->products->paginate($perPage, $offest);
	}

}