<?php

interface ReportRepositoryInterface {
    public function generateSales($id, $params);
    public function generateProducerStatement($id, $params);
}