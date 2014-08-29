<?php

return array(
    'show_warnings' => false,
    'orientation' => 'portrait',
    'defines' => array(
        "DOMPDF_FONT_DIR" => storage_path('fonts/'),
        "DOMPDF_FONT_CACHE" => storage_path('fonts/'),
        "DOMPDF_TEMP_DIR" => sys_get_temp_dir(),
        "DOMPDF_CHROOT" => realpath(base_path()),
        "DOMPDF_UNICODE_ENABLED" => true,
        "DOMPDF_ENABLE_FONTSUBSETTING" => false,
        "DOMPDF_PDF_BACKEND" => "CPDF",
        "DOMPDF_DEFAULT_MEDIA_TYPE" => "screen",
        "DOMPDF_DEFAULT_PAPER_SIZE" => "a4",
        "DOMPDF_DEFAULT_FONT" => "helvetica",
        "DOMPDF_DPI" => 96,
        "DOMPDF_ENABLE_PHP" => true,
        "DOMPDF_ENABLE_JAVASCRIPT" => true,
        "DOMPDF_ENABLE_REMOTE" => false,
        "DOMPDF_FONT_HEIGHT_RATIO" => 1.1,
        "DOMPDF_ENABLE_CSS_FLOAT" => false,
        "DOMPDF_ENABLE_HTML5PARSER" => true,
    ),
);
