<!DOCTYPE html>
<html lang="en">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
	<meta name="description" content="">
	<meta name="author" content="">
	<link rel="shortcut icon" href="images/icon.png">

	<title>Southwest Farm Services</title>
	<style type="text/css">
		body, .cl-mcont { background-color: #fff; font-size: 11px; line-height: 14px; }
		table thead,table tbody { position: fixed; }
		@page { margin: 68px 20px 40px 20px; padding: 0; }
	</style>
</head>
<body>
	<div id="cl-wrapper">
		<div class="container-fluid">
			<div class="cl-mcont">
				<div class="row margin-top-0 margin-bottom-0">
					<div class="col-md-12">
						<div class="content padding-top-0">
							<h2 class="ponumber margin-bottom-0">{{ $order->order_number }}</h2>
						</div>
						<div class="row margin-top-0">
						    <div class="col-md-6">
						    	@if ($order->ordertype === '1')
							    	@if ($order->isfrombid === '0')
							    		Purchased Date: <span class="text-danger">{{ date('m-d-Y h:i A', strtotime($order->created_at)) }}</span><br>
								        Pickup Start: <span class="text-danger">{{ date('m-d-Y', strtotime($order->transportdatestart)) }}</span>
								        Pickup End: <span class="text-danger">{{ date('m-d-Y', strtotime($order->transportdateend)) }}</span><br>
								        Destination: <span class="text-danger">{{ $order->location->location }}</span><br>
							        @else
							        	Bid Date: <span class="text-danger">{{ date('m-d-Y h:i A', strtotime($order->created_at)) }}</span><br>
							    	@endif
						    	@else
						    		Sales Date: <span class="text-danger">{{ date('m-d-Y h:i A', strtotime($order->created_at)) }}</span><br>
							        Delivery Start: <span class="text-danger">{{ date('m-d-Y', strtotime($order->transportdatestart)) }}</span>
							        Delivery End: <span class="text-danger">{{ date('m-d-Y', strtotime($order->transportdateend)) }}</span><br>
							        Nature of Sale: <span class="text-danger">{{ date('m-d-Y', $order->natureofsale->name) }}</span><br>

							        @if (is_object($order->contract))
							        	Contract: <span class="text-danger">{{ $order->contract->contract_number }}</span><br>
							        @endif
						    	@endif

						    	Status: <span class="color-{{ $order->status->class }}">{{ $order->status->name }}</span>
						    	
						    	@if (in_array($order->status->id, array('3','5','6')))
						    		@if ($order->ordercancellingreason->reason->id != '6')
						    			<br>Reason: <span class="text-danger">{{ $order->ordercancellingreason->reason->reason }}
						    		@else
						    			<br>Reason: <span class="text-danger">{{ $order->ordercancellingreason->others }}
						    		@endif
						    	@endif

						    	@if (strlen($order->notes) > 0)
						    		<br>Notes: {{ $order->notes }}
						    	@endif
						    </div>
						    <div class="col-md-6">
						      <address>
						        <p class="margin-top-0 margin-bottom-0">
						          <strong>{{$order->contact->firstname}} {{$order->contact->lastname}} {{$order->contact->suffix}}</strong>
						        </p>
						        {{$order->account->name}}
						        <br>
						        {{$order->orderaddress->street}}
						        <br>
						        {{$order->orderaddress->city}},
						        {{$order->orderaddress->address_states->state_code}}
						        {{$order->orderaddress->zipcode}}
						      </address>
						    </div>
						</div>
						
						<div class="row margin-top-10">
							<div class="col-md-12">
								<h3 class="margin-top-0">Products</h3>
								<div class="content-inner table-responsive">
									<table class="table-condensed table-bordered table-hover">
										<thead>
											<tr>
												<th>Product</th>
												
												@if ($order->ordertype === '1')
													<th>Stack No.</th>
													<th>Location</th>
													<th>Description</th>
												@endif

												@if ($order->isfrombid === '0')
													<th>Unit Price</th>
												@else
													<th>Bid Price</th>
												@endif

												@if ($order->ordertype === '1')
													<th>Bales</th>
												@endif

												<th>Est Tons</th>

												@if ($order->isfrombid === '0')
													<th>Total Price</th>
												@else
													<th>Total Bid</th>
												@endif
											</tr>
										</thead>
										<tbody>
											{? $t_price = 0 ?}
											{? $t_tons = 0 ?}
											{? $t_bales = 0 ?}
											@if (sizeof($order->productsummary) > 0)
												@foreach ($order->productsummary as $products)
													@if ($order->ordertype === '1')
														@if (sizeof($products->productorder) > 0)
															@foreach ($products->productorder as $product)
																<tr>
																	<td>{{ $products->productname->name }}</td>
																	<td><code>{{ strtoupper($product->stacknumber) }}</code></td>
																	<td>{{ $product->sectionfrom->storagelocation->name }} - {{ $product->sectionfrom->name }}</td>
																	<td>{{ $product->description }}</td>
																	<td class="text-right">$ {{ $product->unitprice }}</td>
																	{? $t_bales += $product->bales ?}
																	<td class="text-right">{{ $product->bales }}</td>
																	{? $t_tons += $product->tons ?}
																	<td class="text-right">{{ $product->tons }}</td>
																	{? $_price = $product->tons * $product->unitprice ?}
																	{? $t_price += $_price ?}
																	<td class="text-right">$ {{ number_format($_price, 2, '.', ',') }}</td>
																</tr>
															@endforeach
														@else
															<tr>
																<td>{{ $products->productname->name }}</td>
																<td>&nbsp;</td>
																<td>&nbsp;</td>
																<td>&nbsp;</td>
																<td>&nbsp;</td>
																<td>&nbsp;</td>
																{? $t_tons += $products->tons ?}
																<td class="text-right">{{ $products->tons }}</td>
																<td>&nbsp;</td>
															</tr>
														@endif
													@else
														<tr>
															<td>{{ $products->productname->name }}</td>
															<td class="text-right">$ {{ $products->unitprice }}</td>
															{? $t_tons += $products->tons ?}
															<td class="text-right">{{ $products->tons }}</td>
															{? $_price = $products->tons * $products->unitprice ?}
															{? $t_price += $_price ?}
															<td class="text-right">$ {{ number_format($_price, 2, '.', ',') }}</td>
														</tr>
													@endif
												@endforeach
											@else
												@if ($order->ordertype === '1')
													<tr><td colspan="8">No products found.</td></tr>
												@else
													<tr><td colspan="4">No products found.</td></tr>
												@endif
											@endif
										</tbody>
										<tfoot>
											<tr>
												@if ($order->ordertype === '1')
													<td class="text-right" colspan="5">Total</td>
													<td class="text-right">{{ number_format($t_bales, 0, '.', ',') }}</td>
												@else
													<td class="text-right" colspan="2">Total</td>
												@endif
												<td class="text-right">{{ number_format($t_tons, 4, '.', ',') }}</td>
												<td class="text-right">$ {{ number_format($t_price, 2, '.', ',') }}</td>
											</tr>
										</tfoot>
									</table>
								</div>
							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	</div>

		<script type="text/php">
		    if ( isset($pdf) ) {
		    	// Divide your 0-255 values by 255 to get a decimal approximation.
		    	$c_green = array( 25 / 255, 182 / 255, 152 / 255);
		    	$c_black = array( 153 / 255, 153 / 255, 153 / 255);
		    	$font = Font_Metrics::get_font("helvetica", "normal");
		    	$font_size = 7;

		    	$w = $pdf->get_width();
				$h = $pdf->get_height();

				$pdf->page_text(130, 15, 'Southwest Farm Services', $font, $font_size, $c_green);
				$pdf->page_text(130, 25, '11926 W. Southern Ave.', $font, $font_size, $c_green);
				$pdf->page_text(130, 35, 'Tolleson, AZ 85353', $font, $font_size, $c_green);

				$t_phone = html_entity_decode("Phone : (800) 936-4339 / (623) 936-4339 &nbsp; Fax : (623) 936-7360");
				$width = Font_Metrics::get_text_width($t_phone, $font, '10px');
				$pdf->page_text($w - $width + 70, 35, $t_phone, $font, $font_size, $c_green);

				$pdf->page_text(15, $h - 15, "Page {PAGE_NUM} of {PAGE_COUNT}", $font, $font_size, $c_black);
				$text = html_entity_decode('&copy; '.Date('Y') . ' Southwest Farm Services', ENT_QUOTES, 'UTF-8');
				$width = Font_Metrics::get_text_width($text, $font, '10px');
				$pdf->page_text($w - $width + 30, $h - 15, $text, $font, $font_size, $c_black);

				$pdf->page_script('
					$c_green = array( 25 / 255, 182 / 255, 152 / 255);
			    	$c_black = array( 153 / 255, 153 / 255, 153 / 255);
			    	$font = Font_Metrics::get_font("helvetica", "normal");
			    	$font_size = 7;
					$w = $pdf->get_width();
					$h = $pdf->get_height();
					$img_w = 100;
					$img_h = 26;
					$y = $h - 22;
					$pdf->image(public_path("images/southwest-farm-services-logo-pdf.jpg"), 15, 15, $img_w, $img_h);
					$pdf->line(125, 15, 125, 43, $c_green, 0.5);
					$pdf->line(15, 50, $w - 15, 50, $c_black, 0.5);
					$pdf->line(15, $y, $w - 15, $y, $c_black, 0.5);
				');
			}
		</script>
	</body>
</html>