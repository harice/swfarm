<?php

function generateControlNumber($model, $prefix){ //type default is PO
    $dateToday = date('Y-m-d');
    $count = $model::where('created_at', 'like', $dateToday.'%')->count()+1;
    return $prefix.date('Ymd').'-'.str_pad($count, 4, '0', STR_PAD_LEFT);
}
