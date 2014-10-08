<table>
	<tr>
		<td colspan='8' align='center'><h3>Customer Sales Statement</h3></td>
	</tr>
	<tr>
		<td colspan='8' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

<table>
	<tr>
		<td colspan='3'><strong>{{ $report_o->name }}</strong></td>
		<td></td>
		<td colspan='2'>Statement Date:</td>
		<td colspan='2' align='right'><strong>{{ date('F d, Y') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>{{ $report_o->businessaddress->street }}</td>
		<td></td>
		<td colspan='2' style='background-color:#d7e4c0;'>Total Amount Due:</td>
		<td colspan='2' align='right' style='background-color:#d7e4c0;'><strong>$ {{ number_format($report_o->amount, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>{{ $report_o->businessaddress->city }}, {{ $report_o->businessaddress->state->state_code }} {{ $report_o->businessaddress->zipcode }}</td>
	</tr>
</table>

{{ $_nest_content }}