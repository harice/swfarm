<table>
	<tr>
		<td colspan='9' align='center'><h3>Reserve Customer</h3></td>
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
</table>

{{ $_nest_content }}