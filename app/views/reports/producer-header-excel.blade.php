<table>
	<tr>
		<td colspan='9' align='center'><h3>Producer Statement</h3></td>
	</tr>
	<tr>
		<td colspan='9' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

<table>
	<tr>
		<td colspan='3'><strong>{{ $report_o->name }}</strong></td>
		<td></td>
		<td colspan='2'>Statement Date:</td>
		<td colspan='3' align='right'><strong>{{ date('F d, Y') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>{{ $report_o->businessaddress->street }}</td>
		<td></td>
		<td colspan='2'>Total Load Count:</td>
		<td colspan='3' align='right'><strong>{{ $report_o->total_load }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>{{ $report_o->businessaddress->city }}, {{ $report_o->businessaddress->state->state_code }} {{ $report_o->businessaddress->zipcode }}</td>
		<td></td>
		<td colspan='2'>Total Amount:</td>
		<td colspan='3' align='right'><strong>$ {{ number_format($report_o->amount, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='2'>Less (Scale Fees):</td>
		<td colspan='3' align='right'><strong style='font-color:red;'>- $ {{ number_format($report_o->scale_fees, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='2' style='background-color:#d7e4c0;'>Total Amount Due:</td>
		<td colspan='3' align='right' style='background-color:#d7e4c0;'><strong>$ {{ number_format(($report_o->amount - $report_o->scale_fees), 2, '.', ',') }}</strong></td>
	</tr>
</table>

{{ $_nest_content }}