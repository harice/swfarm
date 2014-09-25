<?php

interface DownloadInterface {
    public function download($params,$mail);
    public function report($params,$type);
    public function fire($job,$params);
}
