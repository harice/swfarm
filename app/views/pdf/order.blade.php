<h1 class='margin-top-30 margin-bottom-30'>
	@if (intval($order->isfrombid) === 0)
		@if (intval($order->ordertype) === 1) Purchase @else Sales @endif Order
	@else
		Bid Details
	@endif
</h1>
<h2><span class='text-danger'>No.:</span> {{ $order->order_number }}</h2>
<div class="float-left witdh-60">
	@if (intval($order->ordertype) === 1)
		@if (intval($order->isfrombid) === 0)
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
	    Nature of Sale: <span class="text-danger">{{ $order->natureofsale->name }}</span><br>

	    @if (is_object($order->contract))
	    	Contract: <span class="text-danger">{{ $order->contract->contract_number }}</span><br>
	    @endif
	@endif

	Status: <span class="text-danger">{{ $order->status->name }}</span>

	@if (in_array(intval($order->status->id), array(3,5,6)))
		@if (intval($order->ordercancellingreason->reason->id) != 6)
			<br>Reason: <span class="text-danger">{{ $order->ordercancellingreason->reason->reason }}
		@else
			<br>Reason: <span class="text-danger">{{ $order->ordercancellingreason->others }}
		@endif
	@endif
</div>

<address class='float-right width-40'>
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

<span class='clear'></span>

@if (strlen($order->notes) > 0)
	<br>Notes: {{ $order->notes }}
@endif

<h3 class="margin-top-30">Products</h3>
<table>
	<thead>
		<tr>
			<th class='width-15'>Stack No.</th>
			@if (intval($order->ordertype) === 1)
				<th class='width-20'>Location</th>
				<th class='width-20'>Description</th>

				@if (intval($order->isfrombid) === 0)
					<th class='width-10'>Unit Price</th>
				@else
					<th class='width-10'>Bid Price</th>
				@endif
				<th class='width-8'>Bales</th>
				<th class='width-12'>Est Tons</th>

				@if (intval($order->isfrombid) === 0)
					<th class='width-15'>Total Price</th>
				@else
					<th class='width-15'>Total Bid</th>
				@endif
			@else
				<th class='width-20'>Description</th>
				<th class='width-8'>Bales</th>
				<th class='width-12'>Tons / Stack</th>
				<th class='width-10'>Unit Price</th>
				<th class='width-12'>Tons / Product</th>
				<th class='width-15'>Total Price</th>
			@endif
		</tr>
	</thead>
	<tbody>
		<tr>
			<td class='height-60 valign-top' colspan='7'>
				<table class='no-border'>
					<tbody>
					{? $t_price = 0 ?}
					{? $t_tons = 0 ?}
					{? $t_bales = 0 ?}					
					@if (sizeof($order->productsummary) > 0)
						@foreach ($order->productsummary as $products)
							@if (intval($order->ordertype) === 1)
								@if (sizeof($products->productorder) > 0)
									<tr>
										<td colspan="7">{{ $products->productname->name }}</td>
									</tr>
									@foreach ($products->productorder as $product)
										<tr>
											<td class='text-danger width-15'>{{ strtoupper($product->stacknumber) }}</td>
											<td class='width-20'>{{ $product->sectionfrom->storagelocation->name }} - {{ $product->sectionfrom->name }}</td>
											<td class='width-20'>{{ $product->description }}</td>
											<td class="text-right width-10">$ {{ number_format($product->unitprice, 2, '.', ',') }}</td>
											{? $t_bales += $product->bales ?}
											<td class="text-right width-8">{{ number_format($product->bales, 0, '.', ',') }}</td>
											{? $t_tons += $product->tons ?}
											<td class="text-right width-12">{{ $product->tons }}</td>
											{? $_price = $product->tons * $product->unitprice ?}
											{? $t_price += $_price ?}
											<td class="text-right width-15">$ {{ number_format($_price, 2, '.', ',') }}</td>
										</tr>
									@endforeach
								@else
									<tr>
										<td colspan='5'>{{ $products->productname->name }}</td>
										{? $t_tons += $products->tons ?}
										<td class="text-right">{{ $products->tons }}</td>
										<td>&nbsp;</td>
									</tr>
								@endif
							@else
								<tr>
									<td class='width-15'>{{ $products->productname->name }}</td>
									<td class='width-20'>&nbsp;</td>
									<td class='width-8'>&nbsp;</td>
									<td class='width-12'>&nbsp;</td>
									<td class="text-right width-10">$ {{ number_format($products->unitprice, 2, '.', ',') }}</td>
									{? $t_tons += $products->tons ?}
									<td class="text-right width-12">{{ $products->tons }}</td>
									{? $_price = $products->tons * $products->unitprice ?}
									{? $t_price += $_price ?}
									<td class="text-right width-15">$ {{ number_format($_price, 2, '.', ',') }}</td>
								</tr>
								@foreach ($products->productorder as $product)
									<tr>
										<td class='text-danger'>{{ strtoupper($product->stacknumber) }}</td>
										<td>{{ $product->description }}</td>
										<td class="text-right width-8">{{ number_format($product->bales, 0, '.', ',') }}</td>
										<td class="text-right width-12">{{ $product->tons }}</td>
										<td>&nbsp;</td>
										<td>&nbsp;</td>
										<td>&nbsp;</td>
									</tr>
								@endforeach
							@endif
						@endforeach
					@else
						<tr>
							<td colspan='7'>No products found.</td>
						</tr>
					@endif
					<tbody>
					<tfoot>
						<tr class='no-border'>
							<td class='text-center' colspan='7'>&nbsp;</td>
						</tr>
						<tr class='no-border'>
							<td class='text-center' colspan='7'>&nbsp;</td>
						</tr>
						<tr class='no-border'>
							<td class='text-center' colspan='7'>
								* * * * Nothing as follows * * * *
							</td>
						</tr>
					</tfoot>		
				</table>
			</td>
		</tr>
	</tbody>
	<tfoot>
		<tr>
			@if (intval($order->ordertype) === 1)
				<td class="text-right" colspan="4">Total</td>
				<td class="text-right">{{ number_format($t_bales, 0, '.', ',') }}</td>
			@else
				<td class="text-right" colspan="5">Total</td>
			@endif
			<td class="text-right">{{ number_format($t_tons, 4, '.', ',') }}</td>
			<td class="text-right">$ {{ number_format($t_price, 2, '.', ',') }}</td>
		</tr>
	</tfoot>
</table>
<table class='no-border'>
 	<tr class='no-border'>
		<td class='text-center' colspan='7'>&nbsp;</td>
	</tr>
    <tr class='no-border'>
		<td class='text-center' colspan='7'>We Gladly Accept VISA, MasterCard & Discover </td>
	</tr>
	<tr class='no-border'>
		<td class='text-center' colspan='7'>If payment for this invoice has already been made... We Thank You! </td>
	</tr>
	<tr class='no-border'>
		<td class='text-center' colspan='7'>Email us at: Info@WeSellHay.com</td>
	</tr>
</table>