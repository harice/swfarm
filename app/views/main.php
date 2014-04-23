<!DOCTYPE html>
<html lang="en">
  	<head>
	    <meta charset="utf-8">
	    <meta http-equiv="X-UA-Compatible" content="IE=edge">
	    <meta name="viewport" content="width=device-width, initial-scale=1">
	    <meta name="description" content="">
	    <meta name="author" content="">

	    <title>Southwest Farms</title>
		<link rel="stylesheet" href="css/smoothness/jquery-ui-1.10.4.custom.min.css">
	    <link rel="stylesheet" href="css/bootstrap.min.css">
		<link rel="stylesheet" href="css/datepicker.min.css">
	    <link rel="stylesheet" href="css/styles.min.css">
	</head>

	<body>
		<div class="topheader bg-primary">
			<div class="container">
				<div class="row">
					<div class="col-md-6 margin-top-bottom-10">
						<a href="/"><img src="images/southwest-farm-services-logo.png"></a>
					</div>
					<div class="col-md-6"></div>
				</div>
			</div>
			<div id="header"></div>
		</div>
<!-- 		<div class="loader">
			<img src="images/loader.gif">
		</div> -->
        <div id="message" class="container"></div>
		<div id="content" class="container min-height-400"></div>

		<div id="footer">
		  <div class="container">
		  	<div class="row">
	  			<div class="col-md-6"><p class="text-muted">&copy; <?php echo date('Y');?> | Southwest Farm Services</p></div>
	  			<div class="col-md-6"><p class="text-muted pull-right">REL <small>v</small><em><?php echo $version; ?></em></p></div>
		  	</div>
		  </div>
		</div>


		<script data-main="js/main" src="js/libs/require/require.js"></script>
  	</body>
</html>