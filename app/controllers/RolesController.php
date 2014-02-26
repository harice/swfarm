<?php

class RolesController extends BaseController {

	protected $layout = 'layout.base';

	/**
	 * Display a listing of the resource.
	 *
	 * @return Response
	 */
	public function index()
	{
        return View::make('roles.index');
	}

	/**
	 * Show the form for creating a new resource.
	 *
	 * @return Response
	 */
	public function create()
	{
        $this->layout->topbar = View::make('layout.topbar');
		$this->layout->footer = View::make('layout.footer');
		$this->layout->scripts = View::make('roles.scripts');
        $this->layout->content = View::make('roles.create');
	}

	/**
	 * Display the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function show($id)
	{
        return View::make('roles.show');
	}

	/**
	 * Show the form for editing the specified resource.
	 *
	 * @param  int  $id
	 * @return Response
	 */
	public function edit($id)
	{
        return View::make('roles.edit');
	}

}