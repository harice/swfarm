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
			Backbone.View.prototype.refreshTitle('Weight Ticket','edit');
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
				
				if(!_.isNull(weightInfo.scaler_account) && typeof weightInfo.scaler_account != 'undefined' && typeof weightInfo.scaler_account.id != 'undefined' && weightInfo.scaler_account.id != null) {
					this.$el.find('#scaleAccount_id').val(weightInfo.scaler_account.id);
					var scaleId = (typeof weightInfo.scale != 'undefined' && typeof weightInfo.scale.id != 'undefined' && weightInfo.scale.id != null)? weightInfo.scale.id : '';
					this.fetchScale(weightInfo.scaler_account.id, scaleId);
				}
				
				var weightInfoBales = (typeof weightInfo.bales != 'undefined' && weightInfo.bales != null)? this.addCommaToNumber(weightInfo.bales) : '';
				this.$el.find('.bales').val(weightInfoBales);
				var weightInfoGross = (typeof weightInfo.gross != 'undefined' && weightInfo.gross != null)? this.addCommaToNumber(weightInfo.gross) : '';
				this.$el.find('.gross').val(weightInfoGross);
				var weightInfoTare = (typeof weightInfo.tare != 'undefined' && weightInfo.tare != null)? this.addCommaToNumber(weightInfo.tare) : '';
				this.$el.find('.tare').val(weightInfoTare);
				var wiNet = (typeof weightInfo.gross != 'undefined' && weightInfo.gross != null && typeof weightInfo.tare != 'undefined' && weightInfo.tare != null)? parseFloat(weightInfo.gross) - parseFloat(weightInfo.tare) : 0;
				this.$el.find('.net').text(this.addCommaToNumber(wiNet.toFixed(4)));
				
				var productsBalesTotal = 0;
				var productsPoundsTotal = 0;
				var productsNetTotal = 0;
				var piCtr = 0;
				_.each(weightInfo.weightticketproducts, function (product) {
					
					var net = (typeof product.pounds != 'undefined' && product.pounds != null)? parseFloat(product.pounds) * Const.LB2TON : 0;
					productsNetTotal += net;
					var bales = (typeof product.bales != 'undefined' && product.bales != null)? parseInt(product.bales) : 0;
					productsBalesTotal += bales;
					var pounds = (typeof product.pounds != 'undefined' && product.pounds != null)? parseFloat(product.pounds) : 0;
					productsPoundsTotal += pounds;
					
					var variables = {
						id: product.id,
						schedule_product_id: product.transportscheduleproduct.id,
						stock_number: product.transportscheduleproduct.productorder.stacknumber,
						name: product.transportscheduleproduct.productorder.product.name,
						number: '.'+piCtr++,
						bales: (parseInt(thisObj.addCommaToNumber(bales)) != 0)? thisObj.addCommaToNumber(bales) : '',
						pounds: (parseFloat(thisObj.addCommaToNumber(pounds)) != 0)? thisObj.addCommaToNumber(pounds.toFixed(2)) : '',
						net: net.toFixed(4),
					};
					
					var productItemTemplate = _.template(weightInfoProductItemTemplate, variables);
					thisObj.$el.find('#product-list tbody').append(productItemTemplate);
				});
				thisObj.$el.find('#product-list tfoot .total-bales').text(this.addCommaToNumber(productsBalesTotal.toString()));
				thisObj.$el.find('#product-list tfoot .total-pounds').text(this.addCommaToNumber(productsPoundsTotal.toFixed(2)));
				thisObj.$el.find('#product-list tfoot .total-net-tons').text(this.addCommaToNumber(productsNetTotal.toFixed(4)));
				
				if(weightInfo.document != null) {
					this.subContainer.find('#uploadedfile').val(weightInfo.document.id);
					this.subContainer.find('#attach-pdf').removeClass('no-attachment');
				}
			}
			else
				Global.getGlobalVars().app_router.navigate(Const.URL.POWEIGHTINFO+'/'+this.poId+'/'+this.schedId, {trigger: true});
		},
	});

	return WeightInfoEditView;
});