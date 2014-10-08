@if (sizeof($report_o->order) > 0)
@if (isset($excel)) 
	{? $border_s = "style='border:1px solid #000;'" ?}
@else
	{? $border_s = '' ?}
@endif
<table class='margin-top-20'>
	<thead>
		<tr>
			<th class='width-10' {{$border_s}}>Date</th>
			<th class='width-13' {{$border_s}}>Order No.</th>
			<th class='width-14' {{$border_s}}>Weight Ticket No.</th>
			<th class='width-18' {{$border_s}}>Account</th>
			<th class='width-18' {{$border_s}}>Origin Loader</th>
			<th class='width-18' {{$border_s}}>Destination Loader</th>
			<th class='width-10' {{$border_s}}>Loaders Fee</th>
		</tr>
	</thead>
	<tbody>
	@foreach ($report_o->order as $order_o)
		@foreach ($order_o->transportschedule as $transportschedule_o)
		<tr>
			<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($transportschedule_o->updated_at))) }}</td>
			<td {{$border_s}}>{{ $order_o->order_number }}</td>
			<td {{$border_s}}>{{ $transportschedule_o->weightticketnumber }}</td>
			<td {{$border_s}}>{{ $order_o->account }}</td>
			<td {{$border_s}}>{{ $transportschedule_o->originloader->lastname }}, {{ $transportschedule_o->originloader->firstname }} {{ $transportschedule_o->originloader->suffix }}</td>
			<td {{$border_s}}>{{ $transportschedule_o->destinationloader->lastname }}, {{ $transportschedule_o->destinationloader->firstname }} {{ $transportschedule_o->destinationloader->suffix }}</td>
			<td class='text-right' align='right' {{$border_s}}>$ {{ number_format(bcadd($transportschedule_o->originloaderfee,$transportschedule_o->destinationloaderfee,2),2,'.',',') }}</td>
		</tr>
		@endforeach
	@endforeach
	</tbody>
</table>
@endif