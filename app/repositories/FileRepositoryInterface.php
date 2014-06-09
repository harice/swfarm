<?php

/**
 *
 * @author Avs
 */
interface FileRepositoryInterface {
    public function uploadFile($params);
    public function store($data);
    public function destroy($id);
    public function validate($data);
    public function instance($data);
}
