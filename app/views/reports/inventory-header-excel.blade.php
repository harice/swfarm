{? $bales_onhand = $report_o->bales_in - $report_o->bales_out ?}
{? $tons_onhand = $report_o->tons_in - $report_o->tons_out ?}
<table>
	<tr>
		<td colspan='13' align='center'><h3>Inventory Report</h3></td>
	</tr>
	<tr>
		<td colspan='13' align='center'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</td>
	</tr>
</table>

<table>
	<tr>
		<td colspan='2'>
			<h3>{{ $report_o->product->name }} : {{ $report_o->stacknumber }}</h3>
		</td>
		<td colspan='7'></td>
		<td colspan='2'>
			Statement Date: 
		</td>
		<td colspan='2' align='right'>
			<strong>{{ date('F d, Y') }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td colspan='2'>
			Bales In:
		</td>
		<td colspan='2' align='right'>
			<strong>{{ $report_o->bales_in }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td colspan='2'>
			Bales Out:
		</td>
		<td colspan='2' align='right'>
			<strong>- {{ $report_o->bales_out }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td colspan='2' style='background-color:#d7e4c0;'>
			On Hand:
		</td>
		<td colspan='2' align='right' style='background-color:#d7e4c0;'>
			<strong>{{ $bales_onhand }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td colspan='2'>
			Tons In:
		</td>
		<td colspan='2' align='right'>
			<strong>{{ $report_o->tons_in }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td colspan='2'>
			Tons Out:
		</td>
		<td colspan='2' align='right'>
			<strong>- {{ $report_o->tons_out }}</strong>
		</td>
	</tr>
	<tr>
		<td colspan='9'></td>
		<td colspan='2' style='background-color:#d7e4c0;'>
			On Hand:
		</td>
		<td colspan='2' align='right' style='background-color:#d7e4c0;'>
			<strong>{{ $tons_onhand }}</strong>
		</td>
	</tr>	

</table>

{{ $_nest_content }}