@if (sizeof($data_o) > 0)
	@if (isset($excel)) 
		{? $border_s = "style='border:1px solid #000;'" ?}
	@else
		{? $border_s = '' ?}
	@endif
	<table class='margin-top-30'>
		<thead>
			<tr>
				<th class='width-9' {{$border_s}}> SO No.</th>
				<th class='width-9' {{$border_s}}> account </th>
				<th class='width-9' {{$border_s}}> orderaddress </th>
				<th class='width-9' {{$border_s}}> natureofsale </th>
				<th class='width-15' {{$border_s}}> status </th>
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

			</tr>
		</thead>
		@foreach ($data_o as $so)
			@foreach($so->productsummary as $prodsum)
				@foreach($prodsum['productorder'] as $prodorder)
					<tr>
						<td {{$border_s}}> {{ $so->order_number }} </td>
						<td {{$border_s}}> {{ $so->account->name }} </td>
						<td {{$border_s}}> @if (!is_null($so->orderaddress_id)) {{ $so->orderaddress->street }}, {{ $so->orderaddress->city }}, {{ $so->orderaddress->address_states->state }}, {{ $so->orderaddress->zipcode }}   @endif </td>
						<td {{$border_s}}> @if (!is_null($so->natureofsale_id)) {{ $so->natureofsale->name; }}  @endif </td>
						<td {{$border_s}}>{{ $so->status->name }}</td>
						<td {{$border_s}}> {{ strtoupper(date('M-d-Y',strtotime($so->created_at))) }} </td>
						<td {{$border_s}}>{{ strtoupper(date('M-d-Y',strtotime($so->transportdatestart))) }}</td>
						<td {{$border_s}}>{{ strtoupper(date('M-d-Y',strtotime($so->transportdateend))) }}</td>
						<td {{$border_s}}> {{ $prodsum['productname']['name'] }} </td>
						<td {{$border_s}}> {{ $prodorder['stacknumber'] }}</td>
						<td {{$border_s}}> {{ $prodorder['unitprice'] }}</td>
						<td {{$border_s}}> {{ $prodorder['bales'] }}</td>
						<td {{$border_s}}>&nbsp; {{ number_format($prodorder['tons'],3,'.',',') }}</td>
						<td {{$border_s}}>{{ $so->weightPercentageDelivered }} % </td>
						<td {{$border_s}}> $ {{ number_format($so->totalPrice,2,'.',',') }}</td>
					
					</tr>
				@endforeach
			@endforeach
		@endforeach
	</table>
@else
	<p class="text-danger">No transactions found.</p>	
@endif