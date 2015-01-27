@if (sizeof($report_o->inventory) > 0)
@if (isset($excel)) 
	{? $border_s = "style='border:1px solid #000;'" ?}
@else
	{? $border_s = '' ?}
@endif
	<table class='margin-top-30'>
		<thead>
			<tr>
				<th class='width-7' {{$border_s}}>Date</th>
				<th class='width-10' {{$border_s}}>Transaction Type</th>
				<th class='width-12' {{$border_s}}>Account</th>
				<th class='width-9' {{$border_s}}>Order No.</th>
				<th class='width-9' {{$border_s}}>Contract No.</th>
				<th class='width-10' {{$border_s}}>Return Order No.</th>
				<th class='width-11' {{$border_s}}>Weight Ticket No.</th>
				<th class='width-11' {{$border_s}}>Location From</th>
				<th class='width-11' {{$border_s}}>Location To</th>
				<th class='width-6' {{$border_s}}>Bales</th>
				<th class='width-7' {{$border_s}}>Tons</th>
				<th class='width-7' {{$border_s}}>Unit Price</th>
				<th class='width-9' {{$border_s}}>Amount</th>
			</tr>
		</thead>
		<tbody>
		@foreach ($report_o->inventory as $inventory_o)
			{? $operator ='' ?}
			@if ($inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_SO') || $inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_ISSUE') )
				{? $class = 'text-danger' ?}
				{? $operator = '-' ?}
				@if (isset($excel)) 
					{? $border_s = "style='border:1px solid #000; color:#a94442;'" ?}				
				@endif
			@elseif ($inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_TRANSFER'))
				{? $class = 'text-success' ?}
				@if (isset($excel)) 
					{? $border_s = "style='border:1px solid #000; color:#428bca;'" ?}				
				@endif
			@else
				{? $class = '' ?}
			@endif
			<tr class='{{ $class }}'>
				<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($inventory_o->updated_at))) }}</td>
				<td {{$border_s}}>{{ $inventory_o->transaction_type }}</td>
				<td {{$border_s}}>{{ $inventory_o->account }}</td>
				<td {{$border_s}}>{{ $inventory_o->order_number }}</td>
				<td {{$border_s}}>{{ $inventory_o->contract_number }}</td>
				<td {{$border_s}}>{{ $inventory_o->order_return }}</td>
				<td {{$border_s}}>{{ $inventory_o->weightticketnumber }}</td>
				<td {{$border_s}}>{{ $inventory_o->location_from }}</td>
				<td {{$border_s}}>{{ $inventory_o->location_to }}</td>
				<td class='text-right' align='right' {{$border_s}}>{{ $operator }} {{ number_format($inventory_o->bales,0,'.',',') }}</td>
				<td class='text-right' align='right' {{$border_s}}>{{ $operator }} {{ number_format($inventory_o->tons,4,'.',',') }}</td>
				@if ($inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_TRANSFER') || $inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_ISSUE') || !is_null($inventory_o->order_return))
				<td>&nbsp;</td>
				<td>&nbsp;</td>
				@else
				<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($inventory_o->price,2,'.',',') }}</td>
				<td class='text-right' align='right' {{$border_s}}>$ {{ number_format(bcmul($inventory_o->tons,$inventory_o->price,2),2,'.',',') }}</td>
				@endif
			</tr>
		@endforeach
		</tbody>
	</table>
@else
	<p class="text-danger">No transactions found.</p>	
@endif