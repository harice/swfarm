<!DOCTYPE html>
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="">
	<meta name="author" content="">
	<link rel="shortcut icon" href="images/icon.png">

	<title>Southwest Farm Services</title>
	<link href="js/libs/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
	<link rel="stylesheet" href="fonts/font-awesome-4.1.0/css/font-awesome.min.css">
	<link rel="stylesheet" href="css/skin-blue.css">
	<link rel="stylesheet" href="css/custom.css">
	
	<style type="text/css">
		body, .cl-mcont { background-color: #fff; font-size: 11px; line-height: 14px; }
		table thead,table tbody { position: fixed; }
		@page { margin: 68px 0 40px 0; padding: 0; }
	</style>
</head>

<body>
	<div id="cl-wrapper">
		<div class="container-fluid">
			<div class="cl-mcont">
				{{$child}}
			</div>
		</div>
	</div>

	<script type="text/php">
	    if ( isset($pdf) ) {
	    	// Divide your 0-255 values by 255 to get a decimal approximation.
	    	$c_green = array( 25 / 255, 182 / 255, 152 / 255);
	    	$c_black = array( 153 / 255, 153 / 255, 153 / 255);
	    	$font = Font_Metrics::get_font("helvetica", "normal");
	    	$font_size = 7;

	    	$w = $pdf->get_width();
			$h = $pdf->get_height();

			$pdf->page_text(130, 15, 'Southwest Farm Services', $font, $font_size, $c_green);
			$pdf->page_text(130, 25, '11926 W. Southern Ave.', $font, $font_size, $c_green);
			$pdf->page_text(130, 35, 'Tolleson, AZ 85353', $font, $font_size, $c_green);

			$t_phone = html_entity_decode("Phone : (800) 936-4339 / (623) 936-4339 &nbsp; Fax : (623) 936-7360");
			$width = Font_Metrics::get_text_width($t_phone, $font, '10px');
			$pdf->page_text($w - $width + 70, 35, $t_phone, $font, $font_size, $c_green);

			$pdf->page_text(15, $h - 15, "Page {PAGE_NUM} of {PAGE_COUNT}", $font, $font_size, $c_black);
			$text = html_entity_decode('&copy; '.Date('Y') . ' Southwest Farm Services', ENT_QUOTES, 'UTF-8');
			$width = Font_Metrics::get_text_width($text, $font, '10px');
			$pdf->page_text($w - $width + 30, $h - 15, $text, $font, $font_size, $c_black);

			$pdf->page_script('
				$c_green = array( 25 / 255, 182 / 255, 152 / 255);
		    	$c_black = array( 153 / 255, 153 / 255, 153 / 255);
		    	$font = Font_Metrics::get_font("helvetica", "normal");
		    	$font_size = 7;
				$w = $pdf->get_width();
				$h = $pdf->get_height();
				$img_w = 100;
				$img_h = 26;
				$y = $h - 22;
				$pdf->image(public_path("images/southwest-farm-services-logo-pdf.jpg"), 15, 15, $img_w, $img_h);
				$pdf->line(125, 15, 125, 43, $c_green, 0.5);
				$pdf->line(15, 50, $w - 15, 50, $c_black, 0.5);
				$pdf->line(15, $y, $w - 15, $y, $c_black, 0.5);
			');
		}
    </script>
</body>
</html>
