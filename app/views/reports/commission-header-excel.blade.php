<table>
	<tr>
		<td colspan='9' align='center'><h3>Commission Statement</h3></td>
	</tr>
	<tr>
		<td colspan='9' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

<table>
	<tr>
		<td colspan='3'><strong>{{ $report_o->user->lastname }}, {{ $report_o->user->firstname }}</strong></td>
		<td colspan='2'></td>
		<td colspan='2'>Statement Date:</td>
		<td colspan='2' align='right'><strong>{{ date('F d, Y') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>Employee No: {{ $report_o->user->emp_no }}</td>
		<td colspan='2'></td>
		<td colspan='2' style='background-color:#d7e4c0;'>Total Amount Due:</td>
		<td colspan='2' align='right' style='background-color:#d7e4c0;'><strong>$ {{ number_format($report_o->amount, 2, '.', ',') }}</strong></td>
	</tr>
	<tr>
		<td colspan='3'>Email: {{ $report_o->user->email }}</td>
	</tr>
</table>
{{ $_nest_content }}