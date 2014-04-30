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
    public function findAll($perPage, $offset, $sortby, $orderby){
        $errorMsg = null;
        $sortby = strtolower($sortby);
        $orderby = strtolower($orderby);
        
        //check if input pass are valid
        if(!($sortby == 'name')){
            $errorMsg = 'Sort by category not found.';
        } else if(!($orderby == 'asc' || $orderby == 'desc')){
            $errorMsg = 'Order by category not found(ASC or DESC expected).';
        } else {
            //pulling of data
            $count = Product::count();
            $productList = Product::take($perPage)->offset($offset)->orderBy($sortby, $orderby)->get();
            
            $data = $productList->toArray();
            
//            $desc_len = strlen($data[0]["description"]);
//            if ($desc_len > 200) {
//                $data[0]["description"] = substr($data[0]["description"], 0, 200) . '...';
//            }

            $response = Response::json(
                array(
                  'data'=>$data,
                  'total'=>$count
                )
            );
        }

        if($errorMsg){
            $response = Response::json(
                array(
                    'error' => true,
                    'message' => $errorMsg),
                200
            );
        }

        return $response;
    
    }
    
    /**
	 * Search product.
	 *
	 * @param  string  $_search
	 * @return Response
	 */
    public function search($_search)
    {
        $perPage  = isset($_search['perpage']) ? $_search['perpage'] : Config::get('constants.GLOBAL_PER_LIST');
        $page     = isset($_search['page']) ? $_search['page'] : 1;
        $sortby   = isset($_search['sortby']) ? $_search['sortby'] : 'name';
        $orderby  = isset($_search['orderby']) ? $_search['orderby'] :'ASC';
        $offset   = $page * $perPage - $perPage;

        $_cnt = Product::where('name','like','%'.$_search['search'].'%')->count();
        
        $_product = Product::where('name','like','%'.$_search['search'].'%')
            ->take($perPage)
            ->offset($offset)
            ->orderBy($sortby, $orderby)
            ->get();
        
        return Response::json(array(
            'data' => $_product->toArray(),
            'total' => $_cnt),
            200
        );
    }
    
    /**
	 * Update the specified resource in storage.
	 *
	 * @param  int  $id
	 * @return Response
	 */
    public function findById($id){
        $product = Product::find($id);

        if($product){
            $response = Response::json(
                $product->toArray(),
                200
            );
        } else {
            $response = Response::json(array(
                'error' => true,
                'message' => "Product not found"),
                200
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
                'message' => Lang::get('messages.success.created', array('entity' => 'Product'))),
                200
            );
        } catch (Exception $e) {
            echo "Oops! " . $e->getMessage();
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

        if($product) {
            $this->validate($data, $id);

            $product->name = $data['name'];
            $product->description = isset($data['description']) ? $data['description'] : null;

            $product->save();

            $response = Response::json(array(
                'error' => false,
                'message' => Lang::get('messages.success.updated', array('entity' => 'Product'))),
                200
            );
        } else {
            $response = Response::json(array(
                'error' => true,
                'message' => Lang::get('messages.notfound', array('entity' => 'Product'))),
                200
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
    public function destroy($id){
        $product = Product::find($id);

        if($product){
            $product->delete();

            $response = Response::json(array(
                'error' => false,
                'message' => Lang::get('messages.success.deleted', array('entity' => 'Product'))),
                200
            );
        } else {
            $response = Response::json(array(
                'error' => true,
                'message' => Lang::get('messages.notfound', array('entity' => 'Product'))),
                200
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
    public function validate($data, $id = null)
    {
        $rules = Product::$rules;
        
        if ($id) {
            $rules['name'] = 'required|unique:products,name,'.$id;
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
}