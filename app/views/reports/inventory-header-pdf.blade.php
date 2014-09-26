<h1 class='margin-top-30 margin-bottom-0 text-center'>Inventory Report</h1>
<p class='text-center text-danger margin-bottom-30'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</p>

<div class='width-50 float-left'>
	<h2 class='margin-bottom-0 margin-top-0'>{{ $report_o->product->name }} : {{ $report_o->stacknumber }}</h2>
</div>

<div class='width-25 float-right'>
	<div class='width-40 float-left'>
		Report Date:
		<br>
		Bales In:
		<br>
		Bales Out:
		<br>
		<hr>
		On Hand:
		<br>
		<br>
		Tons In:
		<br>
		Tons Out:
		<br>
		<hr>
		On Hand:
	</div>
	<div class='width-60 float-right text-right'>
		{{ date('F d, Y') }}
		<br>
		{{ number_format($report_o->bales_in,0,'.',',') }}
		<br>
		<span class='text-danger'>- {{ number_format($report_o->bales_out,0,'.',',') }}</span>
		<br>
		<hr>
		{{ bcsub($report_o->bales_in,$report_o->bales_out,0) }}
		<br>
		<br>
		{{ number_format($report_o->tons_in,4,'.',',') }}
		<br>
		<span class='text-danger'>- {{ number_format($report_o->tons_out,4,'.',',') }}</span>
		<br>
		<hr>
		{{ bcsub($report_o->tons_in,$report_o->tons_out,4) }}
		<br>
	</div>

	<span class='clear'></span>
</div>
<span class='clear'></span>

{{ $_nest_content }}