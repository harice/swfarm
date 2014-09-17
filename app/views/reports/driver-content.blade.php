@if (sizeof($report_o->order) > 0)
	@foreach ($report_o->order as $order_o)
		{? $o_amount = 0 ?}
		<h3 class="margin-top-20">{{ $order_o->order_number }}</h3>
		<table>
			<thead>
				<tr>
					<th class='width-12'>Date</th>
					<th class='width-12'>Truck</th>
					<th class='width-14'>Trucking Rate</th>
					<th class='width-10'>Bales</th>
					<th class='width-12'>Tons</th>
					<th class='width-15'>Gross</th>
					<th class='width-10'>Pay Rate</th>
					<th class='width-15'>Amount</th>
				</tr>
			</thead>
			<tbody>
			@foreach ($order_o->transportschedule as $transportschedule)
				<tr>
					<td>{{ strtoupper(date('d M Y',strtotime($transportschedule->updated_at))) }}</td>
					<td>{{ strtoupper($transportschedule->truck) }}</td>
					<td class='text-right' align='right'>$ {{ number_format($transportschedule->truckingrate,2,'.',',') }}</td>
					<td class='text-right' align='right'>{{ number_format($transportschedule->bales,0,'.',',') }}</td>
					<td class='text-right' align='right'>{{ number_format($transportschedule->tons,4,'.',',') }}</td>
					<td class='text-right' align='right'>$ {{ number_format($transportschedule->gross,2,'.',',') }}</td>
					<td class='text-right' align='right'>{{ number_format($report_o->rate,2,'.',',') }} %</td>
					{? $o_amount += $transportschedule->pay ?}
					<td class='text-right' align='right'>$ {{ number_format($transportschedule->pay,2,'.',',') }}</td>
				</tr>
			@endforeach
			</tbody>
			<tfoot>
				<tr>
					<td colspan='7' class='text-right' align='right'><strong>Total</strong></td>
					<td class='text-right' align='right'><strong>$ {{ number_format($o_amount,2,'.',',') }}</strong></td>
				</tr>
			</tfoot>
		</table>
	@endforeach
@endif