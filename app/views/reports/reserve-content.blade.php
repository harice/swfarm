@if (sizeof($report_o->contract) > 0)
@if (isset($excel)) 
	{? $border_s = "style='border:1px solid #000;'" ?}
@else
	{? $border_s = '' ?}
@endif	
	@foreach ($report_o->contract as $contract)
		<p class="margin-top-20 margin-bottom-0"><strong>{{ $contract->contract_number }}</strong></h3>
		<p class="margin-top-0 margin-bottom-0">Period: {{date('F d, Y',strtotime($contract->contract_date_start))}} to {{date('F d, Y',strtotime($contract->contract_date_end))}}</p>
		<p class="margin-top-0 margin-bottom-0">Status: {{ $contract->status->name }}</p>
		@if (sizeof($contract->order) > 0)
			@foreach ($contract->order as $order)
				<p></p>
				<p class="margin-top-0 margin-bottom-0"><strong>PO No:</strong> {{$order->order_number}}</p>
				<p class="margin-top-0 margin-bottom-0"><strong>PO Status:</strong> {{$order->status->name}}</p>
				<p class="margin-top-0 margin-bottom-0"><strong>Advance:</strong> {{$order->totalPayment}}</p>
				<table class='margin-top-20'>
					<thead>
						<tr>
							<th class='width-9' {{$border_s}}>Producer</th>
							<th class='width-10' {{$border_s}}>Stack No.</th>
							<th class='width-10' {{$border_s}}>Bales Purchased</th>
							<th class='width-10' {{$border_s}}>Bales Delivered</th>
							<th class='width-10' {{$border_s}}>Bales Remaining</th>
							<th class='width-10' {{$border_s}}>Tons Purchased</th>
							<th class='width-10' {{$border_s}}>Tons Delivered</th>
							<th class='width-10' {{$border_s}}>Tons Remaining</th>
							<th class='width-7' {{$border_s}}>Price</th>
						</tr>
					</thead>
					<tbody>
						@foreach ($order->productorder as $productorder)
						<tr>
							<td {{$border_s}}>{{ $order->account->name }}</td>
							<td {{$border_s}}>{{ $productorder->stacknumber }}</td>
							<td {{$border_s}}>{{ $productorder->bales }}</td>
							<td {{$border_s}}>{{ $productorder->balesDelivered }}</td>
							<td {{$border_s}}>
								@if (isset($productorder->balesRemaining))
									{{ $productorder->balesRemaining }}
								@endif	
							</td>
							<td {{$border_s}}>{{ $productorder->tons }}</td>
							<td {{$border_s}}>{{ $productorder->tonsDelivered }}</td>
							<td {{$border_s}}>
								@if (isset($productorder->tonsRemaining)))
									{{ $productorder->tonsRemaining }}
								@endif
							</td>
							<td {{$border_s}}>{{ $productorder->unitprice }}</td>
						</tr>
						@endforeach	
					</tbody>
				</table>
			@endforeach	
		@else
			<p class="text-danger">No results found.</p>	
		@endif	
	@endforeach
@else
	<p class="text-danger">No transactions found.</p>	
@endif