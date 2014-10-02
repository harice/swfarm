<h1 class='margin-top-30 margin-bottom-0 text-center'>Gross Profit Report</h1>
<p class='text-center text-danger margin-bottom-30'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</p>

<div class='width-40 float-right'>
	<div class='width-40 float-left'>
		Report Date:
		<br>
		<br>
		Net Sale:
		<br>
		Less (Hay Cost):
		<br>
		Less (Freight):
		<br>
		Less (Loaders Fee):
		<br>
		Less (Commission):
		<br>
		<hr>
		Profit:
		<br>
		Percentage:
	</div>
	<div class='width-60 float-right text-right'>
		{{ date('F d, Y') }}
		<br>
		<br>
		$ {{ number_format($report_o->netsale, 2, '.', ',') }}
		<br>
		<span class='text-danger'>- $ {{ number_format($report_o->haycost, 2, '.', ',') }}</span>
		<br>
		<span class='text-danger'>- $ {{ number_format($report_o->freight, 2, '.', ',') }}</span>
		<br>
		<span class='text-danger'>- $ {{ number_format($report_o->fees, 2, '.', ',') }}</span>
		<br>
		<span class='text-danger'>- $ {{ number_format($report_o->commission, 2, '.', ',') }}</span>
		<br>
		<hr>
		<strong>$ {{ number_format($report_o->profit, 2, '.', ',') }}</strong>
		<br>
		{{ number_format($report_o->profit_percentage, 2, '.', ',') }} %
		<br>
	</div>

	<span class='clear'></span>
</div>
<span class='clear'></span>

{{ $_nest_content }}