<!DOCTYPE html>
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body>
	<table>
		<tr>
			<td></td>
			<td colspan='{{ $colspan }}'><strong>Southwest Farm Services</strong></td>
		</tr>
		<tr>
			<td></td>
			<td colspan='{{ $colspan }}'>11926 W. Southern Ave., Tolleson, AZ 85353</td>
		</tr>
		<tr>
			<td></td>
			<td colspan='3'>Tolleson, AZ 85353</td>
			<td colspan='{{ $colspan - 3 }}' align='right'>Phone : (800) 936-4339 / (623) 936-4339 Fax : (623) 936-7360</td>
		</tr>
	</table>

	{{ $child }}
</body>
</html>