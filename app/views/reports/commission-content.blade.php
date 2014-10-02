@if (sizeof($report_o->commission) > 0)
{? $amount_i = 0 ?} 
<table class='margin-top-30'>
	<thead>
		<tr>
			<th class='width-9'>Date</th>
			<th class='width-11'>Order No.</th>
			<th class='width-12'>Weight Ticket No.</th>
			<th class='width-15'>Account</th>
			<th class='width-6'>Rate</th>
			<th class='width-8'>Rate Price</th>
			<th class='width-6'>Bales</th>
			<th class='width-8'>Tons</th>
			<th class='width-10'>Amount</th>
		</tr>
	</thead>
	<tbody>
	@foreach ($report_o->commission as $commission_o)
		<tr>
			<td>{{ strtoupper(date('d M Y',strtotime($commission_o->updated_at))) }}</td>
			<td>{{ $commission_o->order_number }}</td>
			<td>{{ $commission_o->weightTicketNumber }}</td>
			<td>{{ $commission_o->account }}</td>
			<td>{{{ $commission_o->type == 1 ? 'FLAT' : 'PER TON' }}}</td>
			<td class='text-right' align='right'>@if (!is_null($commission_o->rate)) $ {{ number_format($commission_o->rate,2,'.',',') }} @endif</td>
			<td class='text-right' align='right'>{{ number_format($commission_o->bales,0,'.',',') }}</td>
			<td class='text-right' align='right'>{{ number_format($commission_o->tons,4,'.',',') }}</td>
			{? $amount_i += $commission_o->amountdue ?}
			<td class='text-right' align='right'>$ {{ number_format($commission_o->amountdue,2,'.',',') }}</td>
		</tr>
	@endforeach
	</tbody>
	<tfoot>
		<tr>
			<td colspan='8' class='text-right' align='right'><strong>Total</strong></td>
			<td class='text-right' align='right'><strong>$ {{ number_format($amount_i,2,'.',',') }}</strong></td>
		</tr>
	</tfoot>
</table>
@endif