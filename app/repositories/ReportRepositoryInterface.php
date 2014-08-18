<?php

interface ReportRepositoryInterface {
    public function generateSales($params);
    public function generateProducerStatement($params);
}