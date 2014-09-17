<h1 class='margin-top-30 margin-bottom-0 text-center'>Driver Pay Statement</h1>
<p class='text-center text-danger margin-bottom-30'>{{ date('F d, Y',strtotime($report_o->report_date->start)) }} - {{ date('F d, Y',strtotime($report_o->report_date->end)) }}</p>

<div class='width-50 float-left'>
	<h2 class='margin-bottom-0 margin-top-0'>{{ $report_o->lastname }}, {{ $report_o->firstname }} {{ $report_o->suffix }}</h2>
	<address>
		<strong>{{ $report_o->account }}</strong>
		<br>
		Email: {{ $report_o->email }}
		<br>
		Phone: {{ $report_o->phone }}
	</address>
</div>

<div class='width-35 float-right'>
	<div class='width-40 float-left'>
		Statement Date:
		<br>
		Total Amount Due:
	</div>
	<div class='width-60 float-right text-right'>
		{{ date('F d, Y') }}
		<br>
		<strong class='padding-right-5'>$ {{ number_format($report_o->amount, 2, '.', ',') }}</strong>
	</div>

	<span class='clear'></span>
</div>
<span class='clear'></span>

{{ $_nest_content }}