<h1 class='margin-top-30 margin-bottom-0 text-center'>Trucking Statement</h1>
<p class='text-center text-danger margin-bottom-30'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</p>

<div class='width-50 float-left'>
	<h2 class='margin-bottom-0'>{{ strtoupper($report_o->trucknumber) }}</h2>
	<address>
		<strong>{{ $report_o->account->name }}</strong>
		<br>
		{{ $report_o->businessaddress->street }}
		<br>
		{{ $report_o->businessaddress->city }},
		{{ $report_o->businessaddress->state->state_code }}
		{{ $report_o->businessaddress->zipcode }}
	</address>
</div>

<div class='width-40 float-right'>
	<div class='width-40 float-left'>
		Statement Date:
		<br>
		Total Bales:
		<br>
		Total Tons:
		<br>
		Total Hauling:
		<br>
		Less (Scale Fees):
		<br>
		<hr>
		Total Amount Due:
	</div>
	<div class='width-60 float-right text-right'>
		{{ date('F d, Y') }}
		<br>
		<br><br>
		<strong>$ {{ number_format($report_o->amount, 2, '.', ',') }}</strong>
		<br>
		<span class='text-danger'>- $ {{ number_format($report_o->fee, 2, '.', ',') }}</span>
		<br>
		<hr>
		<strong class='padding-right-5'>$ {{ number_format(($report_o->amount - $report_o->fee), 2, '.', ',') }}</strong>
	</div>

	<span class='clear'></span>
</div>
<span class='clear'></span>
{{ $_nest_content }}