@if (sizeof($data_o) > 0)
	@if (isset($excel)) 
		{? $border_s = "style='border:1px solid #000;'" ?}
	@else
		{? $border_s = '' ?}
	@endif
	<table class='margin-top-30'>
		<thead>
			<tr>
				<th class='width-9' {{$border_s}}>order_number</th>
				<th class='width-9' {{$border_s}}> account </th>
				<th class='width-9' {{$border_s}}>orderaddress</th>
				<th class='width-9' {{$border_s}}>location</th>
				<th class='width-15' {{$border_s}}> status </th>
				<th class='width-15' {{$border_s}}> notes </th>
				<th class='width-9' {{$border_s}}> created_at </th>
				<th class='width-9' {{$border_s}}> transportdatestart </th>
				<th class='width-9' {{$border_s}}> transportdateend </th> 
				<th class='width-9' {{$border_s}}> productname </th>
				<th class='width-9' {{$border_s}}> stacknumber </th>
				<th class='width-9' {{$border_s}}> unitprice </th>
				<th class='width-9' {{$border_s}}> bales </th>
				<th class='width-9' {{$border_s}}> tons </th>
				<th class='width-9' {{$border_s}}> weightPercentageDelivered </th>
				<th class='width-9' {{$border_s}}> totalPrice </th>
				<th class='width-9' {{$border_s}}> rfv </th>
			</tr>
		</thead>
		@foreach ($data_o as $po)
			@foreach($po->productsummary as $prodsum)
				@foreach($prodsum['productorder'] as $prodorder)
				<tr>
					<td {{$border_s}}> {{ $po->order_number }} </td>
					<td {{$border_s}}> {{ $po->account->name }} </td>
					<td {{$border_s}}> @if (!is_null($po->orderaddress_id)) {{ $po->orderaddress->street }}, {{ $po->orderaddress->city }}, {{ $po->orderaddress->address_states->state }}, {{ $po->orderaddress->zipcode }}   @endif </td>
					<td {{$border_s}}>@if (!is_null($po->location_id)) {{ $po->location->location; }}  @endif</td>
					<td {{$border_s}}>{{ $po->status->name }}</td>
					<td {{$border_s}}>{{ $po->notes }}</td>
					<td {{$border_s}}> {{ strtoupper(date('M-d-Y',strtotime($po->created_at))) }} </td>
					<td {{$border_s}}>{{ strtoupper(date('M-d-Y',strtotime($po->transportdatestart))) }}</td>
					<td {{$border_s}}>{{ strtoupper(date('M-d-Y',strtotime($po->transportdateend))) }}</td>
					<td {{$border_s}}> {{ $prodsum['productname']['name'] }} </td>
					<td {{$border_s}}> {{ $prodorder['stacknumber'] }}</td>
					<td {{$border_s}}> $ {{ number_format($prodorder['unitprice'],2,'.',',') }}</td>
					<td {{$border_s}}> {{ $prodorder['bales'] }}</td>
					<td {{$border_s}}>&nbsp; {{ number_format($prodorder['tons'],3,'.',',') }}</td>
					<td {{$border_s}}>{{ $po->weightPercentageDelivered }} % </td>
					<td {{$border_s}}> $ {{ number_format($po->totalPrice,2,'.',',') }}</td>
					<td {{$border_s}}> {{ $prodorder['rfv'] }}</td>
				</tr>
				@endforeach
			@endforeach
		@endforeach
	</table>
@else
	<p class="text-danger">No transactions found.</p>	
@endif