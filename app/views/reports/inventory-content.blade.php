@if (sizeof($report_o->inventory) > 0)
	<table class='margin-top-30'>
		<thead>
			<tr>
				<th class='width-7'>Date</th>
				<th class='width-10'>Transaction Type</th>
				<th class='width-12'>Account</th>
				<th class='width-9'>Order No.</th>
				<th class='width-9'>Contract No.</th>
				<th class='width-10'>Return Order No.</th>
				<th class='width-11'>Weight Ticket No.</th>
				<th class='width-11'>Location From</th>
				<th class='width-11'>Location To</th>
				<th class='width-6'>Bales</th>
				<th class='width-7'>Tons</th>
				<th class='width-7'>Unit Price</th>
				<th class='width-9'>Amount</th>
			</tr>
		</thead>
		<tbody>
		@foreach ($report_o->inventory as $inventory_o)
			{? $operator ='' ?}
			@if ($inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_SO') || $inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_ISSUE') )
				{? $class = 'text-danger' ?}
				{? $operator = '-' ?}
			@elseif ($inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_TRANSFER'))
				{? $class = 'text-success' ?}
			@else
				{? $class = '' ?}
			@endif
			<tr class='{{ $class }}'>
				<td>{{ strtoupper(date('d M Y',strtotime($inventory_o->updated_at))) }}</td>
				<td>{{ $inventory_o->transaction_type }}</td>
				<td>{{ $inventory_o->account }}</td>
				<td>{{ $inventory_o->order_number }}</td>
				<td>{{ $inventory_o->contract_number }}</td>
				<td>{{ $inventory_o->order_return }}</td>
				<td>{{ $inventory_o->weightticketnumber }}</td>
				<td>{{ $inventory_o->location_from }}</td>
				<td>{{ $inventory_o->location_to }}</td>
				<td class='text-right' align='right'>{{ $operator }} {{ number_format($inventory_o->bales,0,'.',',') }}</td>
				<td class='text-right' align='right'>{{ $operator }} {{ number_format($inventory_o->tons,4,'.',',') }}</td>
				@if ($inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_TRANSFER') || $inventory_o->transaction_id == Config::get('constants.TRANSACTIONTYPE_ISSUE') || !is_null($inventory_o->order_return))
				<td>&nbsp;</td>
				<td>&nbsp;</td>
				@else
				<td class='text-right' align='right'>$ {{ number_format($inventory_o->price,2,'.',',') }}</td>
				<td class='text-right' align='right'>$ {{ number_format(bcmul($inventory_o->tons,$inventory_o->price,2),2,'.',',') }}</td>
				@endif
			</tr>
		@endforeach
		</tbody>
	</table>
@endif