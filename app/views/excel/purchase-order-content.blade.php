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
				<th class='width-11' {{$border_s}}> productname </th>
				<th class='width-12' {{$border_s}}> stacknumber </th>
			</tr>
		</thead>
		@foreach ($data_o as $po)
			@foreach($po->productsummary as $prodsum)
				@foreach($prodsum['productorder'] as $prodorder)
				<tr>
					<td {{$border_s}}> {{ $po->order_number }} </td>
					<td {{$border_s}}> {{ $prodsum['productname']['name'] }} </td>
					<td {{$border_s}}> {{ $prodorder['stacknumber'] }}</td>
				</tr>
				@endforeach
			@endforeach
		@endforeach
	</table>
@else
	<p class="text-danger">No transactions found.</p>	
@endif