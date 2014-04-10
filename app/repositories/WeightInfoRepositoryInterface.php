<?php

/*
 * To change this template, choose Tools | Templates
 * and open the template in the editor.
 */

/**
 *
 * @author Das
 */
interface WeightInfoRepositoryInterface {
    public function findAll();
    public function findById($id);
    public function store($data);
    public function update($id, $data);
    public function destroy($id);
    public function validate($data);
}
