<html>
<head>
	<title>Southwest Farm - Verification of Account</title>
</head>
    <body>

    	@if (count($error) == false)
		    <div>Hello {{$firstname}},</div>
	        <div>&nbsp;</div>
	        <div>{{$message}}</div>
	        <div>&nbsp;</div>
	        <div>Southwest Farm Adminstrator</div>
		@else
	        <div>{{$message}}</div>
	        <div>&nbsp;</div>
	        <div>Southwest Farm Adminstrator</div>
		@endif
        
    </body>
</html>