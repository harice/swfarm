@if (sizeof($report_o->account->orders) > 0)
@if (isset($excel)) 
	{? $border_s = "style='border:1px solid #000;'" ?}
@else
	{? $border_s = '' ?}
@endif
	@foreach ($report_o->account->orders as $order)		
		{? $t_amount = 0 ?}
		{? $t_tons = 0 ?}
		{? $t_bales = 0 ?}
				
		<h3 class="margin-top-30">{{ strtoupper($order->ordernumber) }}</h3>
		<table>
			<thead>
				<tr>
					<th class='width-10' {{$border_s}}>Date</th>
					<th class='width-12' {{$border_s}}>Stack No.</th>
					<th class='width-15' {{$border_s}}>Weight Ticket No.</th>
					<th class='width-8' {{$border_s}}>Price</th>
					<th class='width-12' {{$border_s}}>Net Pounds</th>
					<th class='width-12' {{$border_s}}>Net Tons</th>
					<th class='width-8' {{$border_s}}>Bales</th>
					<th class='width-12' {{$border_s}}>Amount</th>
				</tr>
			</thead>
			<tbody>
				@foreach ($order as $o)
				@if(is_object($o))
					<tr>
						<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($o->date))) }}</td>
						<td {{$border_s}}><span class='text-danger'>{{ strtoupper($o->location) }}</span></td>
						<td {{$border_s}}>{{ $o->weightticket }}</td>
						<td class='text-right' align='right' {{$border_s}}>$ {{ $o->price }}</td>
						<td class='text-right' align='right' {{$border_s}}>{{ $o->pounds }}</td>						
						{? $t_bales += $o->bales ?}
						<td class='text-right' align='right' {{$border_s}}>{{ $o->bales }}</td>
						{? $t_tons += $o->tons ?}
						<td class='text-right' align='right' {{$border_s}}>{{ $o->tons }}</td>
						{? $t_amount += $o->amount ?}
						<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($o->amount,2,'.',',') }}</td>
					</tr>
				@endif
				@endforeach
			</tbody>
			<tfoot>
				<tr>
					<td colspan='5' {{$border_s}}><strong>Total</strong></td>
					<td class='text-right' align='right' {{$border_s}}><strong>{{ number_format($t_tons,4,'.',',') }}</strong></td>
					<td class='text-right' align='right' {{$border_s}}><strong>{{ $t_bales }}</strong></td>
					<td class='text-right' align='right' {{$border_s}}><strong>$ {{ number_format($t_amount,2,'.',',') }}</strong></td>
				</tr>
			</tfoot>
		</table>			
	@endforeach
@endif