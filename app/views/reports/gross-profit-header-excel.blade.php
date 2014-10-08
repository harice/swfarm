<table>
	<tr>
		<td colspan='9' align='center'><h3>Gross Profit Statement</h3></td>
	</tr>
	<tr>
		<td colspan='9' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

<table>
	<tr>
		<td colspan='5'></td>
		<td colspan='2'>
			Report Date: 
		</td>
		<td colspan='2' align='right'>
			<strong>{{ date('F d, Y') }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='5'></td>
		<td colspan='2'>
			Net Sale: 
		</td>
		<td colspan='2' align='right'>
			<strong>{{ $report_o->netsale }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='5'></td>
		<td colspan='2'>
			Less (Hay Cost): 
		</td>
		<td colspan='2' align='right'>
			<strong>{{ $report_o->haycost }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='5'></td>
		<td colspan='2'>
			Less (Freight): 
		</td>
		<td colspan='2' align='right'>
			<strong>{{ $report_o->freight }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='5'></td>
		<td colspan='2'>
			Less (Loaders Fee): 
		</td>
		<td colspan='2' align='right'>
			<strong>{{ $report_o->fees }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='5'></td>
		<td colspan='2'>
			Less (Commission): 
		</td>
		<td colspan='2' align='right'>
			<strong>{{ $report_o->commission }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='5'></td>
		<td colspan='2' style='background-color:#d7e4c0;'>
			Profit: 
		</td>
		<td colspan='2' align='right' style='background-color:#d7e4c0;'>
			<strong>{{ $report_o->profit }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='5'></td>
		<td colspan='2' style='background-color:#d7e4c0;'>
			Percentage: 
		</td>
		<td colspan='2' align='right' style='background-color:#d7e4c0;'>
			<strong>{{ $report_o->profit_percentage }}</strong>
		</td>
	</tr>
</table>
{{ $_nest_content }}