@if (sizeof($data_o) > 0)
	@if (isset($excel)) 
		{? $border_s = "style='border:1px solid #000;'" ?}
	@else
		{? $border_s = '' ?}
	@endif
	<table class='margin-top-30'>
		<thead>
			<tr>
				<th class='width-9' {{$border_s}}> order_number </th>
				<th class='width-9' {{$border_s}}> account </th>
				<th class='width-9' {{$border_s}}>orderaddress</th>
				<th class='width-9' {{$border_s}}>location</th>
				<th class='width-15' {{$border_s}}> purchase_date  </th>
				<th class='width-15' {{$border_s}}> pick_up_start </th>
				<th class='width-9' {{$border_s}}> pick_up_end </th>
				<th class='width-9' {{$border_s}}> notes </th>
				<th class='width-9' {{$border_s}}> product_name </th> 
				<th class='width-9' {{$border_s}}> stack_number </th>
				<th class='width-9' {{$border_s}}> tons </th>
				<th class='width-9' {{$border_s}}> bales </th>
				<th class='width-9' {{$border_s}}> unit_price </th>
				<th class='width-9' {{$border_s}}> total_payment </th>
				<th class='width-9' {{$border_s}}> testing </th>
				<th class='width-9' {{$border_s}}> rfv </th>
				<th class='width-9' {{$border_s}}> transport_date </th>
				<th class='width-9' {{$border_s}}> product_name </th>
				<th class='width-9' {{$border_s}}> stack_number </th>
				<th class='width-9' {{$border_s}}> section </th>
				<th class='width-9' {{$border_s}}> quantity </th>
				<th class='width-9' {{$border_s}}> origin_loader </th>
				<th class='width-9' {{$border_s}}> origin_loader_contact </th>
				<th class='width-9' {{$border_s}}> origin_loader_fee </th>
				<th class='width-9' {{$border_s}}> destination_loader </th>
				<th class='width-9' {{$border_s}}> destination_loader_contact </th>
				<th class='width-9' {{$border_s}}> destination_loader_fee </th>
				<th class='width-9' {{$border_s}}> trucker </th>
				<th class='width-9' {{$border_s}}> trucker_contact </th>
				<th class='width-9' {{$border_s}}> trailer </th>
				<th class='width-9' {{$border_s}}> distance </th>
				<th class='width-9' {{$border_s}}> fuel_charge </th>
				<th class='width-9' {{$border_s}}> handling_fee </th>
				<th class='width-9' {{$border_s}}> trucking_rate </th>
				<th class='width-9' {{$border_s}}> trailer_rate </th>
				<th class='width-9' {{$border_s}}> weight_ticket </th>
				<th class='width-9' {{$border_s}}> loading_ticket </th>
				<th class='width-9' {{$border_s}}> scale </th>
				<th class='width-9' {{$border_s}}> scaler_account </th>
				<th class='width-9' {{$border_s}}> scale_fee </th>
				<th class='width-9' {{$border_s}}> bales </th>
				<th class='width-9' {{$border_s}}> gross </th>
				<th class='width-9' {{$border_s}}> tare </th>
				<th class='width-9' {{$border_s}}> net </th>
				<th class='width-9' {{$border_s}}> product </th>
				<th class='width-9' {{$border_s}}> stack_number </th>
				<th class='width-9' {{$border_s}}> prod_bales </th>
				<th class='width-9' {{$border_s}}> tons </th>
				<th class='width-9' {{$border_s}}> pounds </th>
				<th class='width-9' {{$border_s}}> unloading_ticket </th>
				<th class='width-9' {{$border_s}}> scale </th>
				<th class='width-9' {{$border_s}}> scaler_account </th>
				<th class='width-9' {{$border_s}}> scale_fee </th>
				<th class='width-9' {{$border_s}}> bales </th>
				<th class='width-9' {{$border_s}}> gross </th>
				<th class='width-9' {{$border_s}}> tare </th>
				<th class='width-9' {{$border_s}}> net </th>
				<th class='width-9' {{$border_s}}> product </th>
				<th class='width-9' {{$border_s}}> stack_number </th>
				<th class='width-9' {{$border_s}}> prod_bales </th>
				<th class='width-9' {{$border_s}}> prod_tons </th>
				<th class='width-9' {{$border_s}}> prod_pounds </th>
			</tr>
		</thead>
		@foreach ($data_o as $po)
			<tr>
				<td {{$border_s}}> {{ $po['_po_num'] }} </td>
				<td {{$border_s}}> {{ $po['_acount'] }} </td>
				<td {{$border_s}}> {{ $po['_address'] }} </td>
				<td {{$border_s}}> {{ $po['_location'] }} </td>
				<td {{$border_s}}> {{ $po['_purchased_date'] }} </td>
				<td {{$border_s}}> {{ $po['_pick_up_start'] }} </td>
				<td {{$border_s}}> {{ $po['_pick_up_end'] }} </td>
				<td {{$border_s}}> {{ $po['_notes'] }} </td>
				<td {{$border_s}}> {{ $po['_product_name'] }} </td>
				<td {{$border_s}}> {{ $po['_stack_number'] }} </td>
				<td {{$border_s}}> {{ $po['_tons'] }} </td>
				<td {{$border_s}}> {{ $po['_bales'] }} </td>
				<td {{$border_s}}> {{ $po['_unit_price'] }} </td>
				<td {{$border_s}}> {{ $po['_total_payment'] }} </td>
				<td {{$border_s}}> {{ $po['_testing'] }} </td>
				<td {{$border_s}}> {{ $po['_rfv'] }} </td>
				<td {{$border_s}}> {{ $po['_transport_date'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_product_name'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_stack_number'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_section'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_quantity'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_origin_loader'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_origin_loader_contact'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_origin_loader_fee'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_destination_loader'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_destination_loader_contact'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_destination_loader_fee'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_trucker'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_trucker_contact'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_trailer'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_distance'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_fuel_charge'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_handling_fee'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_trucking_rate'] }} </td>
				<td {{$border_s}}> {{ $po['_ts_trailer_rate'] }} </td>
				<td {{$border_s}}> {{ $po['_weight_ticket'] }} </td>
				<td {{$border_s}}> {{ $po['_loading_ticket'] }} </td>
				<td {{$border_s}}> {{ $po['_l_scale'] }} </td>
				<td {{$border_s}}> {{ $po['_l_scaler_account'] }} </td>
				<td {{$border_s}}> {{ $po['_l_scale_fee'] }} </td>
				<td {{$border_s}}> {{ $po['_l_bales'] }} </td>
				<td {{$border_s}}> {{ $po['_l_gross'] }} </td>
				<td {{$border_s}}> {{ $po['_l_tare'] }} </td>
				<td {{$border_s}}> {{ $po['_l_net'] }} </td>
				<td {{$border_s}}> {{ $po['_l_product'] }} </td>
				<td {{$border_s}}> {{ $po['_l_stack_number'] }} </td>
				<td {{$border_s}}> {{ $po['_l_prod_bales'] }} </td>
				<td {{$border_s}}> {{ $po['_l_tons'] }} </td>
				<td {{$border_s}}> {{ $po['_l_pounds'] }} </td>
				<td {{$border_s}}> {{ $po['_unloading_ticket'] }} </td>
				<td {{$border_s}}> {{ $po['_u_scale'] }} </td>
				<td {{$border_s}}> {{ $po['_u_scaler_account'] }} </td>
				<td {{$border_s}}> {{ $po['_u_scale_fee'] }} </td>
				<td {{$border_s}}> {{ $po['_u_bales'] }} </td>
				<td {{$border_s}}> {{ $po['_u_gross'] }} </td>
				<td {{$border_s}}> {{ $po['_u_tare'] }} </td>
				<td {{$border_s}}> {{ $po['_u_net'] }} </td>
				<td {{$border_s}}> {{ $po['_u_product'] }} </td>
				<td {{$border_s}}> {{ $po['_u_stack_number'] }} </td>
				<td {{$border_s}}> {{ $po['_u_prod_bales'] }} </td>
				<td {{$border_s}}> {{ $po['_u_prod_tons'] }} </td>
				<td {{$border_s}}> {{ $po['_u_prod_pounds'] }} </td>




			</tr>
		@endforeach
	</table>
@else
	<p class="text-danger">No transactions found.</p>	
@endif