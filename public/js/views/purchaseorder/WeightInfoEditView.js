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

	var WeightInfoEditView = WeightInfoAddView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.schedId;
			this.wiId = null;
			this.type = option.type;
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
			Backbone.View.prototype.refreshTitle('Weight Info','edit');
		},
		
		supplyWeightInfoData: function () {
			var thisObj = this;
			var pickupInfo = this.model.get('weightticketscale_pickup');
			var dropoffInfo = this.model.get('weightticketscale_dropoff');
			
			
			if((this.type == Const.WEIGHTINFO.PICKUP && pickupInfo != null) || (this.type == Const.WEIGHTINFO.DROPOFF && dropoffInfo != null)) {
				
				var weightInfo = null;
				if(this.type == Const.WEIGHTINFO.PICKUP)
					weightInfo = pickupInfo;
				else
					weightInfo = dropoffInfo;
					
				this.$el.find('#scaleAccount_id').val(weightInfo.scaler_account[0].id);
				this.fetchScale(weightInfo.scaler_account[0].id, weightInfo.scale.id);
				this.$el.find('#weight-info .bales').val(this.addCommaToNumber(weightInfo.bales));
				this.$el.find('#weight-info .gross').val(this.addCommaToNumber(weightInfo.gross));
				this.$el.find('#weight-info .tare').val(this.addCommaToNumber(weightInfo.tare));
				var wiNet = parseFloat(weightInfo.gross) - parseFloat(weightInfo.tare);
				this.$el.find('#weight-info .net').text(this.addCommaToNumber(wiNet.toFixed(4)));
				
				var productsBalesTotal = 0;
				var productsPoundsTotal = 0;
				var productsNetTotal = 0;
				var piCtr = 0;
				_.each(weightInfo.weightticketproducts, function (product) {
					
					var net = parseFloat(product.pounds) * Const.LB2TON;
					productsNetTotal += net;
					productsBalesTotal += parseFloat(product.bales);
					productsPoundsTotal += parseFloat(product.pounds);
					
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
					thisObj.$el.find('#product-list tbody').append(productItemTemplate);
				});
				thisObj.$el.find('#product-list tfoot .total-bales').text(this.addCommaToNumber(productsBalesTotal.toString()));
				thisObj.$el.find('#product-list tfoot .total-pounds').text(this.addCommaToNumber(productsPoundsTotal.toFixed(2)));
				thisObj.$el.find('#product-list tfoot .total-net-tons').text(this.addCommaToNumber(productsNetTotal.toFixed(4)));
			}
			else
				Global.getGlobalVars().app_router.navigate(Const.URL.POWEIGHTINFO+'/'+this.poId+'/'+this.schedId, {trigger: true});
		},
	});

	return WeightInfoEditView;
});