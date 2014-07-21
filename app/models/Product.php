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
 * @category  Model
 * @package   Product
 * @author    Romualdo Dasig <romualdo.dasig@elementzinteractive.com>
 * @copyright 2014 Elementz Interactive
 * @license   http://www.php.net/license/3_01.txt  PHP License 3.01
 * @link      http://pear.php.net/package/PackageName
 * 
 */

/**
 * Description of AuditRepository class.
 *
 * @category  Model
 * @package   Product
 * @author    Romualdo Dasig <romualdo.dasig@elementzinteractive.com>
 * @copyright 2014 Elementz Interactive
 * @license   http://www.php.net/license/3_01.txt  PHP License 3.01
 * @link      http://pear.php.net/package/PackageName
 */
class Product extends Eloquent {
    
    /**
	 * The database table used by the model.
	 *
	 * @var string
	 */
    protected $table = 'products';
    
    public static $rules = array(
        'name' => 'required|unique:products',
        'description' => 'max:250'
    );

    public function bid(){
    	return $this->belongsToMany('Bid', 'bidproduct', 'product_id', 'bid_id');
    }
    
    public function productorder()
    {
        return $this->belongsTo('ProductOrder', 'id', 'product_id');
    }
    
    public function contractproducts()
    {
        return $this->belongsTo('ContractProducts', 'id', 'product_id');
    }

    public function stack(){
        return $this->hasMany('Stack', 'product_id', 'id')->select(array('id', 'stacknumber', 'product_id'));
    }
}
