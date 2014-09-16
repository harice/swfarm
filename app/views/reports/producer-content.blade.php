@if (sizeof($report_o->storagelocation) > 0)
	@foreach ($report_o->storagelocation as $storagelocation_o)
		@if (sizeof($storagelocation_o->section) > 0)
			@foreach ($storagelocation_o->section as $section_o)
				@if (sizeof($section_o->productorder) > 0)
					{? $t_amount = 0 ?}
					{? $t_tons = 0 ?}
					{? $t_bales = 0 ?}
					<h3 class="margin-top-30">{{ strtoupper($storagelocation_o->name .' - '. $section_o->name) }}</h3>
					<table>
						<thead>
							<tr>
								<th class='width-10'>Date</th>
								<th class='width-12'>Stack No.</th>
								<th class='width-13'>PO No.</th>
								<th class='width-15'>Weight Ticket No.</th>
								<th class='width-8'>Price</th>
								<th class='width-12'>Net Pounds</th>
								<th class='width-12'>Net Tons</th>
								<th class='width-8'>Bales</th>
								<th class='width-12'>Amount</th>
							</tr>
						</thead>
						<tbody>
							@foreach ($section_o->productorder as $product_o)
								<tr>
									<td>{{ strtoupper(date('d M Y',strtotime($product_o->updated_at))) }}</td>
									<td><span class='text-danger'>{{ strtoupper($product_o->stacknumber) }}</span></td>
									<td>{{ $product_o->order_number }}</td>
									<td>{{ $product_o->weightticketnumber }}</td>
									<td class='text-right' align='right'>$ {{ $product_o->unitprice }}</td>
									<td class='text-right' align='right'>{{ $product_o->pounds }}</td>
									{? $t_tons += $product_o->tons ?}
									<td class='text-right' align='right'>{{ $product_o->tons }}</td>
									{? $t_bales += $product_o->bales ?}
									<td class='text-right' align='right'>{{ $product_o->bales }}</td>
									{? $_amount = $product_o->tons * $product_o->unitprice ?}
									{? $t_amount += $_amount ?}
									<td class='text-right' align='right'>$ {{ number_format($_amount,2,'.',',') }}</td>
								</tr>
							@endforeach
						</tbody>
						<tfoot>
							<tr>
								<td colspan='4'><strong>Load Count: {{ $section_o->load_count }}</strong></td>
								<td colspan='2' class='text-right' align='right'><strong>Total</strong></td>
								<td class='text-right' align='right'><strong>{{ number_format($t_tons,4,'.',',') }}</strong></td>
								<td class='text-right' align='right'><strong>{{ $t_bales }}</strong></td>
								<td class='text-right' align='right'><strong>$ {{ number_format($t_amount,2,'.',',') }}</strong></td>
							</tr>
						</tfoot>
					</table>
				@endif
			@endforeach
		@endif
	@endforeach
@endif