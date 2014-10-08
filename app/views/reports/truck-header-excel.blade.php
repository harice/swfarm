<table>
	<tr>
		<td colspan='15' align='center'><h3>Trucking Statement</h3></td>
	</tr>
	<tr>
		<td colspan='15' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

<table>
	<tr>
		<td colspan='9'>Truck No.: <strong>{{ strtoupper($report_o->trucknumber) }}</strong></td>
		<td></td>
		<td colspan='2'>Statement Date:</td>
		<td colspan='3' align='right'><strong>{{ date('F d, Y') }}</strong></td>
	</tr>
	<tr>
		<td colspan='9'>{{ $report_o->account->name }}</td>
		<td></td>
		<td colspan='2'>Total Bales:</td>
		<td colspan='3' align='right'><strong>{{ number_format($report_o->bales, 0, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='9'>{{ $report_o->account->businessaddress->street }}</td>
		<td></td>
		<td colspan='2'>Total Pounds:</td>
		<td colspan='3' align='right'><strong>{{ number_format($report_o->pounds, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='9'>{{ $report_o->account->businessaddress->city }}, {{ $report_o->account->businessaddress->state->state_code }} {{ $report_o->account->businessaddress->zipcode }}</td>
		<td></td>
		<td colspan='2'>Total Tons:</td>
		<td colspan='3' align='right'><strong>{{ number_format($report_o->tons, 4, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='15'></td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td></td>
		<td colspan='2'>Trucking Fee:</td>
		<td colspan='3' align='right'><strong>$ {{ number_format($report_o->hauling, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td></td>
		<td colspan='2'>Handling Fee:</td>
		<td colspan='3' align='right'><strong>$ {{ number_format($report_o->handling, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td></td>
		<td colspan='2'>Fuel Charge:</td>
		<td colspan='3' align='right'><strong>$ {{ number_format($report_o->fuelcharge, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td></td>
		<td colspan='2'>Less (Admin Fees):</td>
		<td colspan='3' align='right'><strong>- $ {{ number_format($report_o->adminfee, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td></td>
		<td colspan='2'>Less (Trailer Rent):</td>
		<td colspan='3' align='right'><strong>- $ {{ number_format($report_o->trailerrent, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td></td>
		<td colspan='2'>Less (Loading Fees):</td>
		<td colspan='3' align='right'><strong>- $ {{ number_format($report_o->loadingfee, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td></td>
		<td colspan='2' style='background-color:#d7e4c0;'>Total Amount Due:</td>
		<td colspan='3' align='right' style='background-color:#d7e4c0;'><strong>$ {{ number_format($report_o->amount, 2, '.', ',') }}</strong></td>
	</tr>
</table>

{{ $_nest_content }}