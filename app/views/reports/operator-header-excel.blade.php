<table>
	<tr>
		<td colspan='7' align='center'><h3>Operator Statement</h3></td>
	</tr>
	<tr>
		<td colspan='7' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

<table>
	<tr>
		<td colspan='3'>
			<h3>{{ $report_o->lastname }}, {{ $report_o->firstname }}</h3>
		</td>
		<td></td>
		<td>
			Statement Date:
		</td>
		<td colspan='2' align='right'>
			<strong>{{ date('F d, Y') }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='3'>
			<strong><i>{{ $report_o->account }}</i></strong>
		</td>
		<td></td>
		<td style='background-color:#d7e4c0;'>
			Total Amount Due:
		</td>
		<td colspan='2' align='right' style='background-color:#d7e4c0;'>
			<strong>{{ $report_o->amount }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='3'>
			<i>Email: {{ $report_o->email }}</i>
		</td>	
	</tr>
	<tr>
		<td colspan='3'>
			<i>Phone: {{ $report_o->phone }}</i>
		</td>
	</tr>
</table>
{{ $_nest_content }}