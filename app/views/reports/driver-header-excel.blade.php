<table>
	<tr>
		<td colspan='9' align='center'><h3>Driver Pay Statement</h3></td>
	</tr>
	<tr>
		<td colspan='9' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

<table>
	<tr>
		<td colspan='4'><strong>{{ $report_o->lastname }}, {{ $report_o->firstname }} {{ $report_o->suffix }}</strong></td>
		<td></td>
		<td colspan='2'>Statement Date:</td>
		<td colspan='2' align='right'><strong>{{ date('F d, Y') }}</strong></td>
	</tr>
	<tr>
		<td colspan='4'><strong>{{ $report_o->account }}</strong></td>
		<td></td>
		<td colspan='2'>Amount:</td>
		<td colspan='2' align='right'><strong>$ {{ number_format($report_o->amount, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='4'>Email: {{ $report_o->email }}</td>
		<td></td>
		<td colspan='2'>Handling Fee:</td>
		<td colspan='2' align='right'><strong>$ {{ number_format($report_o->handling, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='4'>Phone: {{ $report_o->phone }}</td>
		<td></td>
		<td colspan='2' style='background-color:#d7e4c0;'>Total Amount Due:</td>
		<td colspan='2' align='right' style='background-color:#d7e4c0;'><strong>$ {{ number_format(bcadd($report_o->amount,$report_o->handling, 2), 2, '.', ',') }}</strong></td>
	</tr>
</table>

{{ $_nest_content }}