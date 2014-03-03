<?php
 
class ProductsRepository implements ProductsRepositoryInterface {

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

  public function findAll(){
  	return Product::where('id', '!=', 1)->get(); //exclude the super admin
  }

  public function paginate($perPage, $offset){
    return Product::findAll()->take($perPage)->offset($offset)->get();
  }

  public function store($data){
    $rules = array(
      'title' => 'required|unique:products',
      'body' => 'required'
    );

  	$this->validate($data, $rules);
   
  	$product = new Product;
  	$product->title = $data['title'];
  	$product->body = $data['body'];

  	$product->save();

  	return Response::json(array(
  	    'error' => false,
  	    'product' => $product->toArray()),
  	    200
  	);
  }

  public function update($id, $data){
    $rules = array(
      'title' => 'required|unique:products',
      'body' => 'required'
    );

    $product = Product::find($id); //get the product row

    if($product) {
      $this->validate($data, $rules);

      $product->title = $data['title'];
      $product->body = $data['body'];

      $product->save();

      $response = Response::json(array(
          'error' => false,
          'product' => $product->toArray()),
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

  public function destroy($id){
    $product = Product::find($id);

    if($product){
      $product->delete();

      $response = Response::json(array(
          'error' => false,
          'product' => $product->toArray()),
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

  public function validate($data, $rules){
    $validator = Validator::make($data, $rules);

    if($validator->fails()) { 
    	throw new ValidationException($validator); 
    }
  }

  public function instance(){}

}