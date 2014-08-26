<?php

interface ReportRepositoryInterface {
    public function generateCustomerSales($id, $params);
    public function generateProducerStatement($id, $params);
}