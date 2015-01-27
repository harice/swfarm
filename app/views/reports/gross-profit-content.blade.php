@if (sizeof($report_o->orders) > 0)
@if (isset($excel)) 
	{? $border_s = "style='border:1px solid #000;'" ?}
@else
	{? $border_s = '' ?}
@endif
@foreach ($report_o->orders as $order_o)
<h3 class="margin-top-20">{{ $order_o->order_number }} : {{ $order_o->account }}</h3>
<table>
	<thead>
		<tr>
			<th class='width-9' {{$border_s}}>Date</th>
			<th class='width-13' {{$border_s}}>Weight Ticket No.</th>
			<th class='width-10' {{$border_s}}>Net Sale</th>
			<th class='width-10' {{$border_s}}>Hay Cost</th>
			<th class='width-10' {{$border_s}}>Freight</th>
			<th class='width-8' {{$border_s}}>Fees</th>
			<th class='width-10' {{$border_s}}>Commission</th>
			<th class='width-10' {{$border_s}}>Percentage</th>
			<th class='width-10' {{$border_s}}>Profit</th>
		</tr>
	</thead>
	<tbody>
	@foreach ($order_o->productsummary as $productsummary_o)
		@foreach ($productsummary_o->productorder as $productorder_o)
		<tr>
			<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($productorder_o->updated_at))) }}</td>
			<td {{$border_s}}>{{ $productorder_o->weightTicketNumber }}</td>
			<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($productorder_o->netsale,2,'.',',') }}</td>
			<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($productorder_o->haycost,2,'.',',') }}</td>
			<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($productorder_o->freight,2,'.',',') }}</td>
			<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($productorder_o->fees,2,'.',',') }}</td>
			<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($productorder_o->commission,2,'.',',') }}</td>
			<td class='text-right' align='right' {{$border_s}}>{{ number_format($productorder_o->profit_percentage,2,'.',',') }} %</td>
			<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($productorder_o->profit,2,'.',',') }}</td>
		</tr>
		@endforeach
	@endforeach
	</tbody>
</table>
@endforeach
@else
	<p class="text-danger">No transactions found.</p>
@endif