<table>
	<tr>
		<td colspan='14' align='center'><h3>Inventory Report</h3></td>
	</tr>
	<tr>
		<td colspan='14' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

{{ $_nest_content }}