<h1 class='text-center margin-top-30 margin-bottom-30'>@if ($order->ordertype === '1') Purchase @else Sales @endif Order Invoice</h1>
<h2><span class='text-danger'>No.:</span> {{ $order->order_number }}</h2>
<div class="float-left witdh-50">
	@if ($order->ordertype === '1')
		@if ($order->isfrombid === '0')
			Purchased Date: <span class="text-danger">{{ date('m-d-Y h:i A', strtotime($order->created_at)) }}</span><br>
	        Pickup Start: <span class="text-danger">{{ date('m-d-Y', strtotime($order->transportdatestart)) }}</span>
	        Pickup End: <span class="text-danger">{{ date('m-d-Y', strtotime($order->transportdateend)) }}</span><br>
	        Destination: <span class="text-danger">{{ $order->location->location }}</span><br>
	    @else
	    	Bid Date: <span class="text-danger">{{ date('m-d-Y h:i A', strtotime($order->created_at)) }}</span><br>
		@endif
	@else
		Sales Date: <span class="text-danger">{{ date('m-d-Y h:i A', strtotime($order->created_at)) }}</span><br>
	    Delivery Start: <span class="text-danger">{{ date('m-d-Y', strtotime($order->transportdatestart)) }}</span>
	    Delivery End: <span class="text-danger">{{ date('m-d-Y', strtotime($order->transportdateend)) }}</span><br>
	    Nature of Sale: <span class="text-danger">{{ date('m-d-Y', $order->natureofsale->name) }}</span><br>

	    @if (is_object($order->contract))
	    	Contract: <span class="text-danger">{{ $order->contract->contract_number }}</span><br>
	    @endif
	@endif

	Status: <span class="color-{{ $order->status->class }}">{{ $order->status->name }}</span>

	@if (in_array($order->status->id, array('3','5','6')))
		@if ($order->ordercancellingreason->reason->id != '6')
			<br>Reason: <span class="text-danger">{{ $order->ordercancellingreason->reason->reason }}
		@else
			<br>Reason: <span class="text-danger">{{ $order->ordercancellingreason->others }}
		@endif
	@endif

	@if (strlen($order->notes) > 0)
		<br>Notes: {{ $order->notes }}
	@endif
</div>

<address class='float-right width-50'>
	<p class="margin-top-0 margin-bottom-0">
	  <strong>{{$order->contact->firstname}} {{$order->contact->lastname}} {{$order->contact->suffix}}</strong>
	</p>
	{{$order->account->name}}
	<br>
	{{$order->orderaddress->street}}
	<br>
	{{$order->orderaddress->city}},
	{{$order->orderaddress->address_states->state_code}}
	{{$order->orderaddress->zipcode}}
</address>

<span class='clear margin-bottom-20'></span>

<h3 class="margin-top-30">Products</h3>
<table>
	<thead>
		<tr>
			<th class='width-15'>Product</th>
			
			@if ($order->ordertype === '1')
				<th class='width-15'>Stack No.</th>
				<th class='width-15'>Location</th>
				<th class='width-15'>Description</th>
			@endif

			@if ($order->isfrombid === '0')
				<th class='width-10'>Unit Price</th>
			@else
				<th class='width-10'>Bid Price</th>
			@endif

			@if ($order->ordertype === '1')
				<th class='width-10'>Bales</th>
			@endif

			<th class='width-10'>Est Tons</th>

			@if ($order->isfrombid === '0')
				<th class='width-10'>Total Price</th>
			@else
				<th class='width-10'>Total Bid</th>
			@endif
		</tr>
	</thead>
	<tbody>
		{? $t_price = 0 ?}
		{? $t_tons = 0 ?}
		{? $t_bales = 0 ?}
		@if (sizeof($order->productsummary) > 0)
			@foreach ($order->productsummary as $products)
				@if ($order->ordertype === '1')
					@if (sizeof($products->productorder) > 0)
						@foreach ($products->productorder as $product)
							<tr>
								<td>{{ $products->productname->name }}</td>
								<td class='text-danger'>{{ strtoupper($product->stacknumber) }}</td>
								<td>{{ $product->sectionfrom->storagelocation->name }} - {{ $product->sectionfrom->name }}</td>
								<td>{{ $product->description }}</td>
								<td class="text-right">$ {{ $product->unitprice }}</td>
								{? $t_bales += $product->bales ?}
								<td class="text-right">{{ $product->bales }}</td>
								{? $t_tons += $product->tons ?}
								<td class="text-right">{{ $product->tons }}</td>
								{? $_price = $product->tons * $product->unitprice ?}
								{? $t_price += $_price ?}
								<td class="text-right">$ {{ number_format($_price, 2, '.', ',') }}</td>
							</tr>
						@endforeach
					@else
						<tr>
							<td>{{ $products->productname->name }}</td>
							<td>&nbsp;</td>
							<td>&nbsp;</td>
							<td>&nbsp;</td>
							<td>&nbsp;</td>
							<td>&nbsp;</td>
							{? $t_tons += $products->tons ?}
							<td class="text-right">{{ $products->tons }}</td>
							<td>&nbsp;</td>
						</tr>
					@endif
				@else
					<tr>
						<td>{{ $products->productname->name }}</td>
						<td class="text-right">$ {{ $products->unitprice }}</td>
						{? $t_tons += $products->tons ?}
						<td class="text-right">{{ $products->tons }}</td>
						{? $_price = $products->tons * $products->unitprice ?}
						{? $t_price += $_price ?}
						<td class="text-right">$ {{ number_format($_price, 2, '.', ',') }}</td>
					</tr>
				@endif
			@endforeach
		@else
			@if ($order->ordertype === '1')
				<tr><td colspan="8">No products found.</td></tr>
			@else
				<tr><td colspan="4">No products found.</td></tr>
			@endif
		@endif
	</tbody>
	<tfoot>
		<tr>
			@if ($order->ordertype === '1')
				<td class="text-right" colspan="5">Total</td>
				<td class="text-right">{{ number_format($t_bales, 0, '.', ',') }}</td>
			@else
				<td class="text-right" colspan="2">Total</td>
			@endif
			<td class="text-right">{{ number_format($t_tons, 4, '.', ',') }}</td>
			<td class="text-right">$ {{ number_format($t_price, 2, '.', ',') }}</td>
		</tr>
	</tfoot>
</table>