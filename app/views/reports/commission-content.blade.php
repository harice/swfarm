@if (sizeof($report_o->commission) > 0)
@if (isset($excel)) 
	{? $border_s = "style='border:1px solid #000;'" ?}
@else
	{? $border_s = '' ?}
@endif
{? $amount_i = 0 ?} 
<table class='margin-top-30'>
	<thead>
		<tr>
			<th class='width-9' {{$border_s}}>Date</th>
			<th class='width-11' {{$border_s}}>Order No.</th>
			<th class='width-12' {{$border_s}}>Weight Ticket No.</th>
			<th class='width-15' {{$border_s}}>Account</th>
			<th class='width-6' {{$border_s}}>Rate</th>
			<th class='width-8' {{$border_s}}>Rate Price</th>
			<th class='width-6' {{$border_s}}>Bales</th>
			<th class='width-8' {{$border_s}}>Tons</th>
			<th class='width-10' {{$border_s}}>Amount</th>
		</tr>
	</thead>
	<tbody>
	@foreach ($report_o->commission as $commission_o)
		<tr>
			<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($commission_o->updated_at))) }}</td>
			<td {{$border_s}}>{{ $commission_o->order_number }}</td>
			<td {{$border_s}}>{{ $commission_o->weightTicketNumber }}</td>
			<td {{$border_s}}>{{ $commission_o->account }}</td>
			<td {{$border_s}}>{{{ $commission_o->type == 1 ? 'FLAT' : 'PER TON' }}}</td>
			<td class='text-right' align='right' {{$border_s}}>@if (!is_null($commission_o->rate)) $ {{ number_format($commission_o->rate,2,'.',',') }} @endif</td>
			<td class='text-right' align='right' {{$border_s}}>{{ number_format($commission_o->bales,0,'.',',') }}</td>
			<td class='text-right' align='right' {{$border_s}}>{{ number_format($commission_o->tons,4,'.',',') }}</td>
			{? $amount_i += $commission_o->amountdue ?}
			<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($commission_o->amountdue,2,'.',',') }}</td>
		</tr>
	@endforeach
	</tbody>
	<tfoot>
		<tr>
			<td colspan='8' class='text-right' align='right'><strong>Total</strong></td>
			<td class='text-right' align='right' {{$border_s}}><strong>$ {{ number_format($amount_i,2,'.',',') }}</strong></td>
		</tr>
	</tfoot>
</table>
@else
	<p class="text-danger">No transactions found.</p>
@endif