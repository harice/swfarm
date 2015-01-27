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
		<td colspan='3'><strong>{{ $report_o->account->name }}</strong></td>
		<td></td>
		<td colspan='2'>Statement Date:</td>
		<td colspan='3' align='right'><strong>{{ date('F d, Y') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>{{ $report_o->businessaddress->street }}</td>
		<td></td>
		<td colspan='2'>Total Load Count:</td>
		<td colspan='3' align='right'><strong>{{ $report_o->account->loadCount }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>{{ $report_o->account->businessaddress->city }}, {{ $report_o->account->businessaddress->state->state_code }} {{ $report_o->account->businessaddress->zipcode }}</td>
		<td></td>
		<td colspan='2'>Amount:</td>
		<td colspan='3' align='right'><strong>$ {{ number_format($report_o->account->totalAmount, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='2'>Less (Scale Fees):</td>
		<td colspan='3' align='right'><strong style='font-color:red;'>- $ {{ number_format($report_o->account->totalScaleFee, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='2' style='background-color:#d7e4c0;'>Amount Due:</td>
		<td colspan='3' align='right' style='background-color:#d7e4c0;'><strong>$ {{ number_format(($report_o->account->totalAmount - $report_o->totalScaleFee), 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='2'>Less (Payment):</td>
		<td colspan='3' align='right'><strong style='font-color:red;'>- $ {{ number_format($report_o->account->totalPayment, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='2' style='background-color:#d7e4c0;'>Total Amount Due:</td>
		<td colspan='3' align='right' style='background-color:#d7e4c0;'><strong>$ {{ number_format(($report_o->account->totalAmount - $report_o->account->totalScaleFee - $report_o->account->totalPayment), 2, '.', ',') }}</strong></td>
	</tr>
</table>

{{ $_nest_content }}