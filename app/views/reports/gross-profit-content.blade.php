@if (sizeof($report_o->orders) > 0)
@foreach ($report_o->orders as $order_o)
<h3 class="margin-top-20">{{ $order_o->order_number }} : {{ $order_o->account }}</h3>
<table>
	<thead>
		<tr>
			<th class='width-9'>Date</th>
			<th class='width-13'>Weight Ticket No.</th>
			<th class='width-10'>Net Sale</th>
			<th class='width-10'>Hay Cost</th>
			<th class='width-10'>Freight</th>
			<th class='width-8'>Fees</th>
			<th class='width-10'>Commission</th>
			<th class='width-10'>Percentage</th>
			<th class='width-10'>Profit</th>
		</tr>
	</thead>
	<tbody>
	@foreach ($order_o->productsummary as $productsummary_o)
		@foreach ($productsummary_o->productorder as $productorder_o)
		<tr>
			<td>{{ strtoupper(date('d M Y',strtotime($productorder_o->updated_at))) }}</td>
			<td>{{ $productorder_o->weightTicketNumber }}</td>
			<td class='text-right' align='right'>$ {{ number_format($productorder_o->netsale,2,'.',',') }}</td>
			<td class='text-right' align='right'>$ {{ number_format($productorder_o->haycost,2,'.',',') }}</td>
			<td class='text-right' align='right'>$ {{ number_format($productorder_o->freight,2,'.',',') }}</td>
			<td class='text-right' align='right'>$ {{ number_format($productorder_o->fees,2,'.',',') }}</td>
			<td class='text-right' align='right'>$ {{ number_format($productorder_o->commission,2,'.',',') }}</td>
			<td class='text-right' align='right'>{{ number_format($productorder_o->profit_percentage,2,'.',',') }} %</td>
			<td class='text-right' align='right'>$ {{ number_format($productorder_o->profit,2,'.',',') }}</td>
		</tr>
		@endforeach
	@endforeach
	</tbody>
</table>
@endforeach
@endif