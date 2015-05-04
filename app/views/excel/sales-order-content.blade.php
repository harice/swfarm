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
				<th class='width-11' {{$border_s}}> Customer </th>
				<th class='width-12' {{$border_s}}> Nature of Sale </th>
				<th class='width-15' {{$border_s}}> Status </th>
				<th class='width-6' {{$border_s}}> Sales Date </th>
				<th class='width-8' {{$border_s}}> Delivery  Start </th>
				<th class='width-6' {{$border_s}}> Delivery  End </th>
				<th class='width-8' {{$border_s}}> Progress </th>
				<th class='width-10' {{$border_s}}> Total Amount </th>
			</tr>
		</thead>
		@foreach ($data_o as $so)
		<tr>
			<td {{$border_s}}>{{ $so->order_number }}</td>
			<td {{$border_s}}>{{ $so->account->name }}</td>
			<td {{$border_s}}>@if (!is_null($so->natureofsale_id)) {{ $so->natureofsale->name; }}  @endif </td>
			<td {{$border_s}}>{{ $so->status->name }}</td>
			<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($so->created_at))) }}</td>
			<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($so->transportdatestart))) }}</td>
			<td {{$border_s}}>{{ strtoupper(date('d M Y',strtotime($so->transportdateend))) }}</td>
			<td {{$border_s}}>{{ $so->weightPercentageDelivered }} % </td>
			<td {{$border_s}}> $ {{ number_format($so->totalPrice,2,'.',',') }}</td>
		</tr>
			@foreach ($so->transportscheduleDetails as $schedDetails)
			<tr>
				<td></td>
				<td {{$border_s}}> Stack No: {{ $schedDetails['stackNumber'] }}</td>
				<td {{$border_s}}> Product: {{ $schedDetails['productName'] }} </td>
				<td {{$border_s}}></td>
				<td {{$border_s}}></td>
			</tr>
			<thead>
			<tr>
				<th></th>
				<th class='width-9' {{$border_s}} > Schedule </th>
				<th class='width-11' {{$border_s}}> Weight Ticket No. </th>
				<th class='width-12' {{$border_s}}> Expected </th>
				<th class='width-15' {{$border_s}}> Delivered </th>
			</tr>
			</thead>
				@if (sizeof($schedDetails['schedule']) > 0)
					@foreach ($schedDetails['schedule'] as $sched)
					<tr>
						<td></td>
						<td {{$border_s}}> {{ strtoupper(date('d M Y h:i:s a',strtotime($sched['transportscheduledate']))) }} </td>
						<td {{$border_s}}> {{ $sched['weightTicketNumber'] }} </td>
						<td {{$border_s}}> {{ number_format($sched['expected'],3,'.',',')  }}  </td>
						<td {{$border_s}}> {{ number_format($sched['delivered'],3,'.',',') }} </td>
					</tr>
					@endforeach
					<tr>
						<td colspan='8' class='text-right' ></td>
					</tr>
				@else
					<tr>
						<td></td>
						<td colspan='8' class='text-right' >No transactions found.</td>
					</tr>
				@endif
				<tr>
					<td></td>
					<td class='text-right' >Expected: {{ number_format($schedDetails['totalExpected'],3,'.',',') }}</td>
					<td class='text-right' >Total Deliveries: {{ number_format($schedDetails['totalDeliveries'],3,'.',',') }}</td>
					<td class='text-right' >Remaining: {{ number_format($schedDetails['totalExpected'] - $schedDetails['totalDeliveries'],3,'.',',') }}</td>
				</tr>
				<tr>
					<td colspan='8' class='text-right' ></td>
				</tr>
			@endforeach
			<tr>
				<td colspan='8' class='text-right' ></td>
			</tr>
		@endforeach
	</table>
@else
	<p class="text-danger">No transactions found.</p>	
@endif