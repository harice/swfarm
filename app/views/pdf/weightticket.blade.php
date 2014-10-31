<h1 class='margin-top-30 margin-bottom-30'>Weight Ticket</h1>
<h2><span class='text-danger'>No.:</span> {{ $weight_o->weightTicketNumber }}</h2>
Created: <span class="text-danger">{{ strtoupper(date('d M Y h:i A',strtotime($weight_o->created_at))) }}</span><br />
Status: <span class="text-danger">{{ $weight_o->status->name }}</span><br />
Order No: <span class="text-danger">{{ $weight_o->transportschedule->order->order_number }}</span><br />
Scheduled Date: <span class="text-danger">{{ strtoupper(date('d M Y h:i A',strtotime($weight_o->transportschedule->date))) }}</span><br /><br />

@if (sizeof($weight_o->weightticketscale_pickup) > 0)
<h3 class="margin-top-30">Pickup Ticket</h3>
<table>
	<thead>
		<tr>
			<th class='width-20'>Product</th>
			<th class='width-15'>Stack No.</th>	
			<th class='width-15'>Bales</th>	
			<th class='width-15'>Pounds (lbs)</th>	
			<th class='width-15'>Net</th>	
		</tr>
	</thead>
	<tbody>
		{? $tbales = 0 ?}
		{? $tpounds = 0 ?}
		{? $tnet = 0 ?}
		{? $multiplier = 0.0005 ?}
		@foreach ($weight_o->weightticketscale_pickup->weightticketproducts as $product)

			{? $net =  $product->pounds * $multiplier ?}
			{? $tnet +=  $net ?}
			{? $tbales += $product->bales ?}
			{? $tpounds += $product->pounds ?}
				
			<tr>
				<td>{{ $product->transportscheduleproduct->productorder->product->name }}</td>
				<td class='text-danger width-15'>{{ strtoupper($product->transportscheduleproduct->productorder->stacknumber) }}</td>
				<td class="text-right width-10">{{ number_format($product->bales, 0, '.', ',') }}</td>
				<td class="text-right width-10">{{ number_format($product->pounds, 2, '.', ',') }}</td>
				<td class="text-right width-10">{{ number_format($net, 4, '.', ',') }}</td>
			</tr>
		@endforeach
	</tbody>
	<tfoot>
		<tr>
			<td class="text-right" colspan="2">Total</td>
			<td class="text-right">{{ number_format($tbales, 0, '.', ',') }}</td>
			<td class="text-right">{{ number_format($tpounds, 2, '.', ',') }}</td>
			<td class="text-right">{{ number_format($tnet, 4, '.', ',') }}</td>
		</tr>
	</tfoot>
</table>
@endif

@if (sizeof($weight_o->weightticketscale_dropoff) > 0)
<h3 class="margin-top-30">Dropoff Ticket</h3>
<table>
	<thead>
		<tr>
			<th class='width-20'>Product</th>
			<th class='width-15'>Stack No.</th>	
			<th class='width-15'>Bales</th>	
			<th class='width-15'>Pounds (lbs)</th>	
			<th class='width-15'>Net</th>	
		</tr>
	</thead>
	<tbody>
		{? $tbales = 0 ?}
		{? $tpounds = 0 ?}
		{? $tnet = 0 ?}
		{? $multiplier = 0.0005 ?}
		@foreach ($weight_o->weightticketscale_dropoff->weightticketproducts as $product)

			{? $net =  $product->pounds * $multiplier ?}
			{? $tnet +=  $net ?}
			{? $tbales += $product->bales ?}
			{? $tpounds += $product->pounds ?}
				
			<tr>
				<td>{{ $product->transportscheduleproduct->productorder->product->name }}</td>
				<td class='text-danger width-15'>{{ strtoupper($product->transportscheduleproduct->productorder->stacknumber) }}</td>
				<td class="text-right width-10">{{ number_format($product->bales, 0, '.', ',') }}</td>
				<td class="text-right width-10">{{ number_format($product->pounds, 2, '.', ',') }}</td>
				<td class="text-right width-10">{{ number_format($net, 4, '.', ',') }}</td>
			</tr>
		@endforeach
	</tbody>
	<tfoot>
		<tr>
			<td class="text-right" colspan="2">Total</td>
			<td class="text-right">{{ number_format($tbales, 0, '.', ',') }}</td>
			<td class="text-right">{{ number_format($tpounds, 2, '.', ',') }}</td>
			<td class="text-right">{{ number_format($tnet, 4, '.', ',') }}</td>
		</tr>
	</tfoot>
</table>
@endif