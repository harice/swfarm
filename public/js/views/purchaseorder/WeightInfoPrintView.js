define([
	'backbone',
	'bootstrapdatepicker',
	'views/purchaseorder/WeightInfoAddView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/purchaseorder/PurchaseOrderModel',
	'models/purchaseorder/POScheduleModel',
	'models/purchaseorder/POWeightInfoModel',
	'collections/product/ProductCollection',
	'collections/account/AccountCollection',
	'collections/scale/ScaleCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/weightInfoAddTemplate.html',
	'text!templates/purchaseorder/weightInfoProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			WeightInfoAddView,
			Validate,
			TextFormatter,
			PurchaseOrderModel,
			POScheduleModel,
			POWeightInfoModel,
			ProductCollection,
			AccountCollection,
			ScaleCollection,
			contentTemplate,
			weightInfoAddTemplate,
			weightInfoProductItemTemplate,
			Global,
			Const
){

	var WeightInfoPrintView = WeightInfoAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.schedId;
			this.wiId = null;
			this.h1Title = 'Weight Info';
			this.h1Small = 'edit';
			
			this.model = new POWeightInfoModel({id:this.schedId});
			this.model.on('change', function() {
				thisObj.wiId = this.get('id');
				thisObj.inits();
				thisObj.purchaseOrderModel.runFetch();
				this.off('change');
			});
		},
		
		render: function(){
			this.model.runFetch();
			Backbone.View.prototype.refreshTitle('Weight Info','print');
		},
		
		supplyWeightInfoData: function () {
			var thisObj = this;
			var pickupInfo = this.model.get('weightticketscale_pickup');
			var dropoffInfo = this.model.get('weightticketscale_dropoff');
			
			this.$el.find('#pickup-scaleAccount_id').val(pickupInfo.scaler_account[0].id);
			this.fetchPickupScale(pickupInfo.scaler_account[0].id, pickupInfo.scale.id);
			this.$el.find('#pickup-info .bales').val(this.addCommaToNumber(pickupInfo.bales));
			this.$el.find('#pickup-info .gross').val(this.addCommaToNumber(pickupInfo.gross));
			this.$el.find('#pickup-info .tare').val(this.addCommaToNumber(pickupInfo.tare));
			var pickupNet = parseFloat(pickupInfo.gross) - parseFloat(pickupInfo.tare);
			this.$el.find('#pickup-info .net').text(this.addCommaToNumber(pickupNet.toFixed(4)));
			
			this.$el.find('#dropoff-scaleAccount_id').val(dropoffInfo.scaler_account[0].id);
			this.fetchDropoffScale(dropoffInfo.scaler_account[0].id, dropoffInfo.scale.id);
			this.$el.find('#dropoff-info .fee').val(this.addCommaToNumber(dropoffInfo.fee));
			this.$el.find('#dropoff-info .bales').val(this.addCommaToNumber(dropoffInfo.bales));
			this.$el.find('#dropoff-info .gross').val(this.addCommaToNumber(dropoffInfo.gross));
			this.$el.find('#dropoff-info .tare').val(this.addCommaToNumber(dropoffInfo.tare));
			var dropffNet = parseFloat(dropoffInfo.gross) - parseFloat(dropoffInfo.tare);
			this.$el.find('#dropoff-info .net').text(this.addCommaToNumber(dropffNet.toFixed(4)));
			
			var pickupProductsBalesTotal = 0;
			var pickupProductsPoundsTotal = 0;
			var pickupProductsNetTotal = 0;
			var piCtr = 0;
			_.each(pickupInfo.weightticketproducts, function (product) {
				
				var net = parseFloat(product.pounds) * Const.LB2TON;
				pickupProductsNetTotal += net;
				pickupProductsBalesTotal += parseFloat(product.bales);
				pickupProductsPoundsTotal += parseFloat(product.pounds);
				
				var variables = {
					id: product.id,
					schedule_product_id: product.transportscheduleproduct.id,
					stock_number: product.transportscheduleproduct.productorder.stacknumber,
					name: product.transportscheduleproduct.productorder.product.name,
					route_type: thisObj.options.routeType[0]+thisObj.options.separator,
					number: '.'+piCtr++,
					bales: thisObj.addCommaToNumber(product.bales),
					pounds: thisObj.addCommaToNumber(product.pounds),
					net: net.toFixed(4),
				};
				
				var productItemTemplate = _.template(weightInfoProductItemTemplate, variables);
				thisObj.$el.find('#pickup-product-list tbody').append(productItemTemplate);
			});
			thisObj.$el.find('#pickup-product-list tfoot .total-bales').text(this.addCommaToNumber(pickupProductsBalesTotal.toString()));
			thisObj.$el.find('#pickup-product-list tfoot .total-pounds').text(this.addCommaToNumber(pickupProductsPoundsTotal.toFixed(2)));
			thisObj.$el.find('#pickup-product-list tfoot .total-net-tons').text(this.addCommaToNumber(pickupProductsNetTotal.toFixed(4)));
			
			
			var dropoffProductsBalesTotal = 0;
			var dropoffProductsPoundsTotal = 0;
			var dropoffProductsNetTotal = 0;
			var doCtr = 0;
			_.each(dropoffInfo.weightticketproducts, function (product) {
				
				var net = parseFloat(product.pounds) * Const.LB2TON;
				dropoffProductsNetTotal += net;
				dropoffProductsBalesTotal += parseFloat(product.bales);
				dropoffProductsPoundsTotal += parseFloat(product.pounds);
				
				var variables = {
					id: product.id,
					schedule_product_id: product.transportscheduleproduct.id,
					stock_number: product.transportscheduleproduct.productorder.stacknumber,
					name: product.transportscheduleproduct.productorder.product.name,
					route_type: thisObj.options.routeType[1]+thisObj.options.separator,
					number: '.'+doCtr++,
					bales: thisObj.addCommaToNumber(product.bales),
					pounds: thisObj.addCommaToNumber(product.pounds),
					net: net.toFixed(4),
				};
				
				var productItemTemplate = _.template(weightInfoProductItemTemplate, variables);
				thisObj.$el.find('#dropoff-product-list tbody').append(productItemTemplate);
			});
			thisObj.$el.find('#dropoff-product-list tfoot .total-bales').text(this.addCommaToNumber(dropoffProductsBalesTotal.toString()));
			thisObj.$el.find('#dropoff-product-list tfoot .total-pounds').text(this.addCommaToNumber(dropoffProductsPoundsTotal.toFixed(2)));
			thisObj.$el.find('#dropoff-product-list tfoot .total-net-tons').text(this.addCommaToNumber(dropoffProductsNetTotal.toFixed(4)));
		},
	});

	return WeightInfoPrintView;
});