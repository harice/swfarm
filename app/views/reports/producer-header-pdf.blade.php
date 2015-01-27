<h1 class='margin-top-30 margin-bottom-0 text-center'>Producer Statement</h1>
<p class='text-center text-danger margin-bottom-30'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</p>

<div class='width-50 float-left'>
	<h2 class='margin-bottom-0'>{{ $report_o->account->name }}</h2>
	<address>
		{{ $report_o->account->businessaddress->street }}
		<br>
		{{ $report_o->account->businessaddress->city }},
		{{ $report_o->account->businessaddress->state->state }}
		{{ $report_o->account->businessaddress->zipcode }}
	</address>
</div>

<div class='width-40 float-right'>
	<div class='width-40 float-left'>
		Statement Date:
		<br>
		Total Load Count:
		<br><br>
		Amount:
		<br>
		Less (Scale Fees):
		<br>
		<hr>
		Amount Due:
		<br>
		Less (Payment):
		<br>
		<hr>
		Total Amount Due:
	</div>
	<div class='width-60 float-right text-right'>
		{{ date('F d, Y') }}
		<br>
		{{ $report_o->account->loadcount }}
		<br><br>
		<strong>$ {{ number_format($report_o->account->totalAmount, 2, '.', ',') }}</strong>
		<br>
		<span class='text-danger'>- $ {{ number_format($report_o->account->totalScaleFee, 2, '.', ',') }}</span>
		<br>
		<hr>
		<strong class='padding-right-5'>$ {{ number_format(($report_o->account->totalAmount - $report_o->account->totalScaleFee), 2, '.', ',') }}</strong>
		<br>
		<span class='text-danger'>- $ {{ number_format($report_o->account->totalPayment, 2, '.', ',') }}</span>
		<br>
		<hr>
		<strong class='padding-right-5'>$ {{ number_format(($report_o->account->totalAmount - $report_o->account->totalScaleFee - $report_o->account->totalPayment), 2, '.', ',') }} </strong>
	</div>

	<span class='clear'></span>
</div>
<span class='clear'></span>
{{ $_nest_content }}