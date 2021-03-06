<table>
	<tr>
		<td colspan='8' align='center'><h3>Producer Statement</h3></td>
	</tr>
	<tr>
		<td colspan='8' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

<table>
	<tr>
		<td colspan='3'><strong>{{ $report_o->account->name }}</strong></td>
		<td></td>
		<td colspan='1'>Statement Date:</td>
		<td colspan='3' align='right'><strong>{{ date('F d, Y') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>{{ $report_o->account->businessaddress->street }}</td>
		<td></td>
		<td colspan='1'>Total Load Count:</td>
		<td colspan='3' align='right'><strong>{{ $report_o->account->loadcount }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>{{ $report_o->account->businessaddress->city }}, {{ $report_o->account->businessaddress->state->state }} {{ $report_o->account->businessaddress->zipcode }}</td>
		<td></td>
		<td colspan='1'>Amount:</td>
		<td colspan='3' align='right'><strong>$ {{ number_format($report_o->account->totalAmount, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='1'>Less (Scale Fees):</td>
		<td colspan='3' align='right'><strong style='font-color:red;'>- $ {{ number_format($report_o->account->totalScaleFee, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='1' style='background-color:#d7e4c0;'>Amount Due:</td>
		<td colspan='3' align='right' style='background-color:#d7e4c0;'><strong>$ {{ number_format(($report_o->account->totalAmount - $report_o->account->totalScaleFee), 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='1'>Less (Payment):</td>
		<td colspan='3' align='right'><strong style='font-color:red;'>- $ {{ number_format($report_o->account->totalPayment, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'></td>
		<td></td>
		<td colspan='1' style='background-color:#d7e4c0;'>Total Amount Due:</td>
		<td colspan='3' align='right' style='background-color:#d7e4c0;'><strong>$ {{ number_format(($report_o->account->totalAmount - $report_o->account->totalScaleFee - $report_o->account->totalPayment), 2, '.', ',') }}</strong></td>
	</tr>
</table>

{{ $_nest_content }}