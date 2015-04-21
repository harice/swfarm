@if (sizeof($report_o->order) > 0)
@if (isset($excel)) 
	{? $border_s = "style='border:1px solid #000;'" ?}
@else
	{? $border_s = '' ?}
@endif
	@foreach ($report_o->order as $order_o)
		{? $o_amount = $handling_i = 0 ?}
		<h3 class="margin-top-20">{{ $order_o->order_number }}</h3>
		<table>
			<thead>
				<tr>
					<th class='width-12' {{$border_s}}>Date</th>
					<th class='width-12' {{$border_s}}>Truck</th>
					<th class='width-12' {{$border_s}}>Trucking Rate</th>
					<th class='width-10' {{$border_s}}>Bales</th>
					<th class='width-12' {{$border_s}}>Tons</th>
					<th class='width-15' {{$border_s}}>Gross</th>
					<th class='width-10' {{$border_s}}>Pay Rate</th>
					<th class='width-12' {{$border_s}}>Handling Fee</th>
					<th class='width-15' {{$border_s}}>Amount</th>
				</tr>
			</thead>
			<tbody>
			@foreach ($order_o->transportschedule as $transportschedule)
				<tr>
					<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($transportschedule->updated_at))) }}</td>
					<td {{$border_s}}>{{ strtoupper($transportschedule->truck) }}</td>
					<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($transportschedule->truckingrate,2,'.',',') }}</td>
					<td class='text-right' align='right' {{$border_s}}>{{ number_format($transportschedule->bales,0,'.',',') }}</td>
					<td class='text-right' align='right' {{$border_s}}>{{ number_format($transportschedule->tons,3,'.',',') }}</td>
					<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($transportschedule->gross,2,'.',',') }}</td>
					<td class='text-right' align='right' {{$border_s}}>{{ number_format($report_o->rate,2,'.',',') }} %</td>
					{? $handling_i = bcadd($handling_i,$transportschedule->handlingfee,2) ?}
					<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($transportschedule->handlingfee,2,'.',',') }}</td>
					{? $o_amount += $transportschedule->pay ?}
					<td class='text-right' align='right' {{$border_s}}>$ {{ number_format($transportschedule->pay,2,'.',',') }}</td>
				</tr>
			@endforeach
			</tbody>
			<tfoot>
				<tr>
					<td colspan='7' class='text-right' align='right'><strong>Total</strong></td>
					<td class='text-right' align='right' {{$border_s}}><strong>$ {{ number_format($handling_i,2,'.',',') }}</strong></td>
					<td class='text-right' align='right' {{$border_s}}><strong>$ {{ number_format($o_amount,2,'.',',') }}</strong></td>
				</tr>
			</tfoot>
		</table>
	@endforeach
@else
	<p class="text-danger">No transactions found.</p>	
@endif