<?php

function filter_number($n)
{
    // Format input numbers.
    $n = (0+str_replace(",", "", $n));

    // Is this a number?
    if (!is_numeric($n)) {
        throw new Exception('Not good numeric format, I think.');
    }
    
    return $n;
}
