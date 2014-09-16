@if (sizeof($report_o->order) > 0)
	@foreach ($report_o->order as $order_o)
		{? $o_amount = 0 ?}
		<h3 class="margin-top-20">{{ $order_o->order_number }}</h3>
		<table>
			<thead>
				<tr>
					<th class='width-12'>Date</th>
					<th class='width-15'>Product</th>
					<th class='width-18'>Weight Ticket No.</th>
					<th class='width-10'>Bales</th>
					<th class='width-15'>Pounds</th>
					<th class='width-12'>Tons</th>
					<th class='width-13'>Price</th>
					<th class='width-15'>Amount</th>
				</tr>
			</thead>
			<tbody>
			@foreach ($order_o->productsummary as $product_o)
				@foreach ($product_o->productorder as $productorder_o)
					<tr>
						<td>{{ strtoupper(date('d M Y',strtotime($productorder_o->updated_at))) }}</td>
						<td>{{ $product_o->product }}</td>
						<td>{{ $productorder_o->weightTicketNumber }}</td>
						<td class='text-right' align='right'>{{ number_format($productorder_o->bales,0,'.',',') }}</td>
						<td class='text-right' align='right'>{{ number_format($productorder_o->pounds,2,'.',',') }}</td>
						{? $_amount = $productorder_o->tons * $product_o->unitprice ?}
						{? $o_amount += $_amount ?}
						<td class='text-right' align='right'>{{ number_format($productorder_o->tons,4,'.',',') }}</td>
						<td class='text-right' align='right'>$ {{ number_format($product_o->unitprice,2,'.',',') }}</td>
						<td class='text-right' align='right'>$ {{ number_format($_amount,2,'.',',') }}</td>
					</tr>
				@endforeach
			@endforeach
			</tbody>
			<tfoot>
				<tr>
					<td colspan='7' class='text-right' align='right'><strong>Total</strong></td>
					<td class='text-right' align='right'><strong>$ {{ number_format($o_amount,2,'.',',') }}</strong></td>
				</tr>
			</tfoot>
		</table>
	@endforeach
@endif