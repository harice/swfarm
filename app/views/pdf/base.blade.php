<!DOCTYPE html>
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="">
	<meta name="author" content="">

	<title>Southwest Farm Services</title>
	
	<style type="text/css">
		body { background-color: #fff; font-size: 7pt; line-height: 14px; }
		.float-left { float: left; }
		.float-right { float: right; }
		.clear { clear:both; }
		
		.margin-top-0 { margin-top: 0; }
		.margin-top-20 { margin-top: 20px; }
		.margin-top-30 { margin-top: 30px; }
		.margin-bottom-0 { margin-bottom: 0; }
		.margin-bottom-30 { margin-bottom: 30px; }

		.padding-right-5 { padding-right: 5px; }

		.width-6 { width: 6%; }
		.width-8 { width: 8%; }
		.width-10 { width: 10%; }
		.width-12 { width: 12%; }
		.width-13 { width: 13%; }
		.width-15 { width: 15%; }
		.width-18 { width: 18%; }
		.width-20 { width: 20%; }
		.width-30 { width: 30%; }
		.width-35 { width: 35%; }
		.width-40 { width: 40%; }
		.width-50 { width: 50%; }
		.width-60 { width: 60%; }
		.width-70 { width: 70%; }

		.height-60 { height: 60%; }

		.text-danger { color: #a94442; }
		.text-center { text-align: center; }
		.text-right { text-align: right; }

		.font-italic { font-style: italic; }

		.valign-top { vertical-align: top; }
		.no-border { border: 0; }

		hr { border: 0; border-collapse: collapse; height: 1px; background: #ddd; }

		table { border-collapse: collapse; width: 100%; border: thin solid #ddd; margin:0; padding: 0; }
		td, th {  text-align: left; vertical-align: top; padding: 5px 2px; }
		tfoot td, thead th { border: thin solid #ddd; font-weight: bold; }
		tfoot tr.no-border td { border: 0; font-weight: bold; }
		@page { margin: 70px 20px 60px 20px; padding: 0; }
	</style>
</head>

<body>
	
	{{$child}}

	<script type="text/php">
	    if ( isset($pdf) ) {
	    	// Divide your 0-255 values by 255 to get a decimal approximation.
	    	$c_green = array( 25 / 255, 182 / 255, 152 / 255);
	    	$c_black = array( 0, 0, 0 );
	    	$font = Font_Metrics::get_font("courier", "normal");
	    	$font_size = 7;

	    	$w = $pdf->get_width();
			$h = $pdf->get_height();

			$pdf->page_text(130, 15, 'Southwest Farm Services', $font, $font_size, $c_black);
			$pdf->page_text(130, 25, '11926 W. Southern Ave.', $font, $font_size, $c_black);
			$pdf->page_text(130, 35, 'Tolleson, AZ 85353', $font, $font_size, $c_black);

			$t_phone = html_entity_decode("Phone : (800) 936-4339 / (623) 936-4339 &nbsp; Fax : (623) 936-7360");
			$width = Font_Metrics::get_text_width($t_phone, $font, '10px');
			$pdf->page_text($w - $width + 97, 35, $t_phone, $font, $font_size, $c_black);

			$n_font = Font_Metrics::get_font("courier", "italic");
			$pdf->page_text(15, $h - 35, "*This document is system generated.", $n_font, $font_size, $c_black);
			$pdf->page_text(15, $h - 15, "Page {PAGE_NUM} of {PAGE_COUNT}", $font, $font_size, $c_black);
			$text = html_entity_decode('&copy; '.Date('Y') . ' Southwest Farm Services', ENT_QUOTES, 'UTF-8');
			$width = Font_Metrics::get_text_width($text, $font, '10px');
			$pdf->page_text($w - $width + 39, $h - 15, $text, $font, $font_size, $c_black);

			$pdf->page_script('
				$c_green = array( 25 / 255, 182 / 255, 152 / 255);
		    	$c_black = array( 153 / 255, 153 / 255, 153 / 255);
				$w = $pdf->get_width();
				$h = $pdf->get_height();
				$img_w = 100;
				$img_h = 26;
				$y = $h - 22;
				$pdf->image(public_path("images/southwest-farm-services-logo-pdf.jpg"), 15, 15, $img_w, $img_h);
				$pdf->line(125, 15, 125, 43, $c_black, 0.5);
				$pdf->line(15, 50, $w - 15, 50, $c_black, 0.5);
				$pdf->line(15, $y, $w - 15, $y, $c_black, 0.5);
			');
		}
    </script>
</body>
</html>
