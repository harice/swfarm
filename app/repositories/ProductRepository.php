<?php

/**
 * Short description of file
 *
 * PHP version 5
 *
 * LICENSE: This source file is subject to version 3.01 of the PHP license
 * that is available through the world-wide-web at the following URI:
 * http://www.php.net/license/3_01.txt.  If you did not receive a copy of
 * the PHP License and are unable to obtain it through the web, please
 * send a note to license@php.net so we can mail you a copy immediately.
 *
 * @category  Repository
 * @package   ProductRepository
 * @author    Romualdo Dasig <romualdo.dasig@elementzinteractive.com>
 * @copyright 2014 Elementz Interactive
 * @license   http://www.php.net/license/3_01.txt  PHP License 3.01
 * @link      http://pear.php.net/package/PackageName
 *
 */

/**
 * Description of AuditRepository class.
 *
 * @category  Repository
 * @package   ProductRepository
 * @author    Romualdo Dasig <romualdo.dasig@elementzinteractive.com>
 * @copyright 2014 Elementz Interactive
 * @license   http://www.php.net/license/3_01.txt  PHP License 3.01
 * @link      http://pear.php.net/package/PackageName
 */
class ProductRepository implements ProductRepositoryInterface {

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function findAll($params)
    {
        try {
            $perPage = isset($params['perpage']) ? $params['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
            $sortby = isset($params['sortby']) ? $params['sortby'] : 'name';
            $orderby = isset($params['orderby']) ? $params['orderby'] : 'asc';
            $all = isset($params['all']) ? $params['all'] : false;

            $product = Product::orderBy($sortby, $orderby);

            if (isset($params['search'])) {
                $product = $product->where('name', 'like', '%' . $params['search'] . '%');
            }

            if($all == true)
            {
                $perPage = $product->count();
            }

            return $product->paginate($perPage);

        } catch (Exception $e) {
            return $e->getMessage();
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function findById($id)
    {
        $product = Product::find($id);

        if ($product) {
            $response = Response::json(
                    $product->toArray(), 200
            );
        } else {
            $response = Response::json(array(
                    'error' => true,
                    'message' => "Product not found"), 200
            );
        }

        return $response;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function store($data)
    {
        $this->validate($data);

        try {
            $product = new Product;
            $product->name = $data['name'];
            $product->description = isset($data['description']) ? $data['description'] : null;

            $product->save();

            return Response::json(array(
                    'error' => false,
                    'message' => Lang::get('messages.success.created', array('entity' => 'Product'))), 200
            );
        } catch (Exception $e) {
            return $e->getMessage();
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function update($id, $data)
    {
        $product = Product::find($id); //get the product row

        if ($product) {
            $this->validate($data, $id);

            $product->name = $data['name'];
            $product->description = isset($data['description']) ? $data['description'] : null;

            $product->save();

            $response = Response::json(array(
                    'error' => false,
                    'message' => Lang::get('messages.success.updated', array('entity' => 'Product'))), 200
            );
        } else {
            $response = Response::json(array(
                    'error' => true,
                    'message' => Lang::get('messages.notfound', array('entity' => 'Product'))), 200
            );
        }

        return $response;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function destroy($id)
    {
        $product = Product::with('orders')->with('contracts')->where('id', '=', $id)->first();

        if ($product) {
            if (!$this->hasTransaction($id)) {
                $product->forceDelete();

//                return Response::json(array(
//                        'error' => false,
//                        'message' => Lang::get('messages.success.deleted', array('entity' => 'Product'))), 200
//                );
            } else {
                $product->delete();
//                if (!$this->hasOpenTransaction($product)) {
//                    $product->delete();
//
//                    return Response::json(array(
//                            'error' => false,
//                            'message' => Lang::get('messages.success.deleted', array('entity' => 'Product'))), 200
//                    );
//                } else {
//                    return Response::json(
//                            array(
//                            'error' => true,
//                            'message' => 'Cannot delete product with open transactions.'
//                            ), 200
//                    );
//                }
            }

            return Response::json(array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Product'))), 200
            );
        } else {
            return Response::json(array(
                    'error' => true,
                    'message' => Lang::get('messages.notfound', array('entity' => 'Product'))), 200
            );
        }

        return Response::json(
                array(
                'error' => true,
                'message' => 'Product was not deleted'
                ), 200
        );
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function validate($data, $id = null)
    {
        $rules = Product::$rules;

        if ($id) {
            $rules['name'] = 'required|unique:products,name,' . $id;
        }

        $validator = Validator::make($data, $rules);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        return true;
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  int  $id
     * @return Response
     */
    public function instance($data = array())
    {
        return new Product($data);
    }

    /**
     * Check if Product has existing transaction.
     *
     * @param   type     $id Product Id
     * @return  boolean
     */
    public function hasTransaction($id)
    {
        if (
            DB::table('contract_products')->where('product_id', '=', $id)->count() ||
            DB::table('productorder')->where('product_id', '=', $id)->count() ||
            DB::table('productordersummary')->where('product_id', '=', $id)->count() ||
            DB::table('stack')->where('product_id', '=', $id)->count()
        ) {
            return true;
        }

        return false;
    }

    /**
     *
     * @param Model $product
     */
    public function hasOpenTransaction($product)
    {
        foreach ($product->contracts as $contract) {
            if ($contract->status_id == 2) {
                return false;
            }
        }
        foreach ($product->orders as $order) {
            if ($order->status_id == 2) {
                return false;
            }
        }

        return true;
    }

}
