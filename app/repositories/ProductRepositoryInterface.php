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
 * @category  Interface
 * @package   ProductInterface
 * @author    Romualdo Dasig <romualdo.dasig@elementzinteractive.com>
 * @copyright 2014 Elementz Interactive
 * @license   http://www.php.net/license/3_01.txt  PHP License 3.01
 * @link      http://pear.php.net/package/PackageName
 * 
 */

/**
 * Description of ProductInterface class.
 *
 * @category  Interface
 * @package   ProductInterface
 * @author    Romualdo Dasig <romualdo.dasig@elementzinteractive.com>
 * @copyright 2014 Elementz Interactive
 * @license   http://www.php.net/license/3_01.txt  PHP License 3.01
 * @link      http://pear.php.net/package/PackageName
 */
interface ProductRepositoryInterface {
    public function findAll($perPage, $offset, $sortby, $orderby);
    public function search($_search);
    public function findById($id);
    public function store($data);
	public function update($id, $data);
	public function destroy($id);
	public function validate($data);
	public function instance();
}