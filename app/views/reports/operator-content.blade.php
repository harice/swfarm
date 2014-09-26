@if (sizeof($report_o->order) > 0)
<table class='margin-top-20'>
	<thead>
		<tr>
			<th class='width-10'>Date</th>
			<th class='width-13'>Order No.</th>
			<th class='width-14'>Weight Ticket No.</th>
			<th class='width-18'>Account</th>
			<th class='width-18'>Origin Loader</th>
			<th class='width-18'>Destination Loader</th>
			<th class='width-10'>Loaders Fee</th>
		</tr>
	</thead>
	<tbody>
	@foreach ($report_o->order as $order_o)
		@foreach ($order_o->transportschedule as $transportschedule_o)
		<tr>
			<td>{{ strtoupper(date('d M Y',strtotime($transportschedule_o->updated_at))) }}</td>
			<td>{{ $order_o->order_number }}</td>
			<td>{{ $transportschedule_o->weightticketnumber }}</td>
			<td>{{ $order_o->account }}</td>
			<td>{{ $transportschedule_o->originloader->lastname }}, {{ $transportschedule_o->originloader->firstname }} {{ $transportschedule_o->originloader->suffix }}</td>
			<td>{{ $transportschedule_o->destinationloader->lastname }}, {{ $transportschedule_o->destinationloader->firstname }} {{ $transportschedule_o->destinationloader->suffix }}</td>
			<td class='text-right' align='right'>$ {{ number_format(bcadd($transportschedule_o->originloaderfee,$transportschedule_o->destinationloaderfee,2),2,'.',',') }}</td>
		</tr>
		@endforeach
	@endforeach
	</tbody>
</table>
@endif