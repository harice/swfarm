@if (sizeof($report_o->order) > 0)
@if (isset($excel)) 
	{? $border_s = "style='border:1px solid #000;'" ?}
@else
	{? $border_s = '' ?}
@endif
	@foreach ($report_o->order as $order_o)
		{? $gross_i = $trailer_i = $trucking_i = $tons_i = $bales_i = $pounds_i = $loader_i = $fuelcharge_i = $adminfee_i = $amount_i = 0 ?}
		<h3 class="margin-top-20">{{ $order_o->order_number }}</h3>
		<table>
			<thead>
				<tr>
					<th class='width-7' {{$border_s}}>Date</th>
					<th class='width-10' {{$border_s}}>Weight Ticket No.</th>
					<th class='width-12' {{$border_s}}>Origin Loader</th>
					<th class='width-12' {{$border_s}}>Destination Loader</th>
					<th class='width-7' {{$border_s}}>Loaders Fee</th>
					<th class='width-6' {{$border_s}}>Bales</th>
					<th class='width-8' {{$border_s}}>Pounds</th>
					<th class='width-8' {{$border_s}}>Tons</th>
					<th class='width-8' {{$border_s}}>Rate</th>
					<th class='width-9' {{$border_s}}>Gross Rate</th>
					<th class='width-6' {{$border_s}}>Rent</th>
					<th class='width-9' {{$border_s}}>Fuel Charge</th>

					<th class='width-7' {{$border_s}}>Admin Fee</th>
					<th class='width-9' {{$border_s}}>Amount</th>
					
				</tr>
			</thead>
			<tbody>
			@foreach ($order_o->transportschedule as $transportschedule_o)
				<tr>
					<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($transportschedule_o->updated_at))) }}</td>
					<td {{$border_s}}>{{ $transportschedule_o->weightticketnumber }}</td>
					<td {{$border_s}}>{{ $transportschedule_o->originloader->lastname }}, {{ $transportschedule_o->originloader->firstname }} {{ $transportschedule_o->originloader->suffix }}</td>
					<td {{$border_s}}>{{ $transportschedule_o->destinationloader->lastname }}, {{ $transportschedule_o->destinationloader->firstname }} {{ $transportschedule_o->destinationloader->suffix }}</td>
					<td {{$border_s}} class='text-right' align='right'>$ {{ number_format(($transportschedule_o->originloaderfee + $transportschedule_o->destinationloaderfee),2,'.',',') }}</td>
					{? $loader_i += ($transportschedule_o->originloaderfee + $transportschedule_o->destinationloaderfee) ?}
					<td {{$border_s}} class='text-right' align='right'>{{ number_format($transportschedule_o->bales,0,'.',',') }}</td>
					{? $bales_i += $transportschedule_o->bales ?}
					<td {{$border_s}} class='text-right' align='right'>{{ number_format($transportschedule_o->pounds,2,'.',',') }}</td>
					{? $pounds_i += $transportschedule_o->pounds ?}
					<td {{$border_s}} class='text-right' align='right'>{{ number_format($transportschedule_o->tons,4,'.',',') }}</td>
					{? $tons_i += $transportschedule_o->tons ?}
					<td {{$border_s}} class='text-right' align='right'>$ {{ number_format($transportschedule_o->truckingrate,2,'.',',') }}</td>
					{? $trucking_i += $transportschedule_o->truckingrate ?}
					<td {{$border_s}} class='text-right' align='right'>$ {{ number_format($transportschedule_o->gross,2,'.',',') }}</td>
					{? $gross_i += $transportschedule_o->gross ?}
					<td {{$border_s}} class='text-right' align='right'>$ {{ number_format($transportschedule_o->trailerrate,2,'.',',') }}</td>
					{? $trailer_i += $transportschedule_o->trailerrate ?}
					<td {{$border_s}} class='text-right' align='right'>$ {{ number_format($transportschedule_o->fuelcharge,2,'.',',') }}</td>
					{? $fuelcharge_i += $transportschedule_o->fuelcharge ?}
					<td {{$border_s}} class='text-right' align='right'>$ {{ number_format($transportschedule_o->adminfee,2,'.',',') }}</td>
					{? $adminfee_i += $transportschedule_o->adminfee ?}
					<td {{$border_s}} class='text-right' align='right'>$ {{ number_format($transportschedule_o->amount,2,'.',',') }}</td>
					{? $amount_i += $transportschedule_o->amount ?}
					
				</tr>
			@endforeach
			</tbody>
			<tfoot>
				<tr>
					<td colspan='4' class='text-right' align='right'><strong>Total</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>$ {{ number_format($loader_i,2,'.',',') }}</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>{{ number_format($bales_i,0,'.',',') }}</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>{{ number_format($pounds_i,2,'.',',') }}</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>{{ number_format($tons_i,4,'.',',') }}</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>$ {{ number_format($trucking_i,2,'.',',') }}</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>$ {{ number_format($gross_i,2,'.',',') }}</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>$ {{ number_format($trailer_i,2,'.',',') }}</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>$ {{ number_format($fuelcharge_i,2,'.',',') }}</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>$ {{ number_format($adminfee_i,2,'.',',') }}</strong></td>
					<td {{$border_s}} class='text-right' align='right'><strong>$ {{ number_format($amount_i,2,'.',',') }}</strong></td>
				</tr>
			</tfoot>
		</table>
	@endforeach
@endif