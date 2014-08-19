<?php

/**
 *
 * @author Avs
 */
interface DocumentRepositoryInterface {
    public function uploadDocument($params);
    public function store($data);
    public function destroy($id);
    public function validate($data);
    public function instance($data);
}
