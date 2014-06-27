define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/purchaseorder/PurchaseOrderModel',
	'models/purchaseorder/POScheduleModel',
	'models/purchaseorder/POWeightInfoModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/purchaseorder/weightInfoViewTemplate.html',
	'text!templates/purchaseorder/weightInfoViewProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			PurchaseOrderModel,
			POScheduleModel,
			POWeightInfoModel,
			contentTemplate,
			purchaseOrderTabbingTemplate,
			weightInfoViewTemplate,
			weightInfoViewProductItemTemplate,
			Global,
			Const
){

	var WeightInfoView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.schedId;
			this.h1Title = 'Weight Info';
			this.h1Small = 'view';
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generatePOTabs(this.poId, 3)}));
			
			this.purchaseOrderModel = new PurchaseOrderModel({id:this.poId});
			this.purchaseOrderModel.on('change', function() {
				thisObj.poScheduleModel.runFetch();
				thisObj.off('change');
			});
			
			this.poScheduleModel = new POScheduleModel({id:this.schedId});
			this.poScheduleModel.on('change', function() {
				thisObj.model.runFetch();
				thisObj.off('change');
			});
			
			this.model = new POWeightInfoModel({id:this.schedId});
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					/*if(typeof this.get('weightTicketNumber') === 'undefined')
						Global.getGlobalVars().app_router.navigate(Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD, {trigger: true});
					else {
						
						thisObj.displayForm();
						thisObj.supplyWeightInfoData();
					}*/
					
					thisObj.displayForm();
					thisObj.supplyWeightInfoData();
				}
				
				this.off('change');
			});
		},
		
		render: function(){
			this.purchaseOrderModel.runFetch();
			Backbone.View.prototype.refreshTitle('Weight Info','view');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				pickup_weight_info_edit_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT+'/'+Const.WEIGHTINFO.PICKUP,
				pickup_weight_info_add_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD+'/'+Const.WEIGHTINFO.PICKUP,
				dropoff_weight_info_edit_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT+'/'+Const.WEIGHTINFO.DROPOFF,
				dropoff_weight_info_add_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD+'/'+Const.WEIGHTINFO.DROPOFF,
                weight_info_print_url: '#/'+Const.URL.POWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+'print',
				previous_po_sched_url: '#/'+Const.URL.PICKUPSCHEDULE+'/'+this.poId,
			};
			
			if(this.model.get('weightticketscale_pickup') != null)
				innerTemplateVariables['has_pickup_info'] = true;
			if(this.model.get('weightticketscale_dropoff') != null)
				innerTemplateVariables['has_dropoff_info'] = true;
			
			var innerTemplate = _.template(weightInfoViewTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.find('#with-tab-content').html(compiledTemplate);
		},
		
		supplyWeightInfoData: function () {
			var thisObj = this;
			var pickupInfo = this.model.get('weightticketscale_pickup');
			var dropoffInfo = this.model.get('weightticketscale_dropoff');
			
			var dateAndTime = this.convertDateFormat(this.poScheduleModel.get('scheduledate'), this.dateFormatDB, this.dateFormat, '-')
								+' '+this.poScheduleModel.get('scheduletimeHour')
								+':'+this.poScheduleModel.get('scheduletimeMin')
								+' '+this.poScheduleModel.get('scheduletimeAmPm');
			
			this.$el.find('#po-number').val(this.purchaseOrderModel.get('order_number'));
			this.$el.find('#producer').val(this.purchaseOrderModel.get('account').name);
			this.$el.find('#date-and-time').val(dateAndTime);
			this.$el.find('#weight-ticket-no').val(this.model.get('weightTicketNumber'));
			this.$el.find('#loading-ticket-no').val(this.model.get('loadingTicketNumber'));
			
			if(pickupInfo != null) {
				this.$el.find('#pickup-fields').show();
				this.$el.find('#pickup-info .scale-account').val(pickupInfo.scaler_account[0].name);
				this.$el.find('#pickup-info .scale-name').val(pickupInfo.scale.name);
				this.$el.find('#pickup-info .fee').val(this.addCommaToNumber(pickupInfo.fee));
				this.$el.find('#pickup-info .bales').val(this.addCommaToNumber(pickupInfo.bales));
				this.$el.find('#pickup-info .gross').val(this.addCommaToNumber(pickupInfo.gross));
				this.$el.find('#pickup-info .tare').val(this.addCommaToNumber(pickupInfo.tare));
				var pickupNet = parseFloat(pickupInfo.gross) - parseFloat(pickupInfo.tare);
				this.$el.find('#pickup-info .net').text(this.addCommaToNumber(pickupNet.toFixed(4)));
				
				var pickupProductsBalesTotal = 0;
				var pickupProductsPoundsTotal = 0;
				var pickupProductsNetTotal = 0;
				_.each(pickupInfo.weightticketproducts, function (product) {
					
					var net = parseFloat(product.pounds) * Const.LB2TON;
					pickupProductsNetTotal += net;
					pickupProductsBalesTotal += parseFloat(product.bales);
					pickupProductsPoundsTotal += parseFloat(product.pounds);
					
					var variables = {
						stack_number: product.transportscheduleproduct.productorder.stacknumber,
						name: product.transportscheduleproduct.productorder.product.name,
						bales: thisObj.addCommaToNumber(product.bales),
						pounds: thisObj.addCommaToNumber(product.pounds),
						net: net.toFixed(4),
					};
					
					var productItemTemplate = _.template(weightInfoViewProductItemTemplate, variables);
					thisObj.$el.find('#pickup-product-list tbody').append(productItemTemplate);
				});
				thisObj.$el.find('#pickup-product-list tfoot .total-bales').text(this.addCommaToNumber(pickupProductsBalesTotal.toString()));
				thisObj.$el.find('#pickup-product-list tfoot .total-pounds').text(this.addCommaToNumber(pickupProductsPoundsTotal.toFixed(2)));
				thisObj.$el.find('#pickup-product-list tfoot .total-net-tons').text(this.addCommaToNumber(pickupProductsNetTotal.toFixed(4)));
			}
			
			if(dropoffInfo != null) {
				this.$el.find('#dropoff-fields').show();
				this.$el.find('#dropoff-info .scale-account').val(dropoffInfo.scaler_account[0].name);
				this.$el.find('#dropoff-info .scale-name').val(dropoffInfo.scale.name);
				this.$el.find('#dropoff-info .fee').val(this.addCommaToNumber(dropoffInfo.fee));
				this.$el.find('#dropoff-info .bales').val(this.addCommaToNumber(dropoffInfo.bales));
				this.$el.find('#dropoff-info .gross').val(this.addCommaToNumber(dropoffInfo.gross));
				this.$el.find('#dropoff-info .tare').val(this.addCommaToNumber(dropoffInfo.tare));
				var dropffNet = parseFloat(dropoffInfo.gross) - parseFloat(dropoffInfo.tare);
				this.$el.find('#dropoff-info .net').text(this.addCommaToNumber(dropffNet.toFixed(4)));
				
				var dropoffProductsBalesTotal = 0;
				var dropoffProductsPoundsTotal = 0;
				var dropoffProductsNetTotal = 0;
				_.each(dropoffInfo.weightticketproducts, function (product) {
					
					var net = parseFloat(product.pounds) * Const.LB2TON;
					dropoffProductsNetTotal += net;
					dropoffProductsBalesTotal += parseFloat(product.bales);
					dropoffProductsPoundsTotal += parseFloat(product.pounds);
					
					var variables = {
						stack_number: product.transportscheduleproduct.productorder.stacknumber,
						name: product.transportscheduleproduct.productorder.product.name,
						bales: thisObj.addCommaToNumber(product.bales),
						pounds: thisObj.addCommaToNumber(product.pounds),
						net: net.toFixed(4),
					};
					
					var productItemTemplate = _.template(weightInfoViewProductItemTemplate, variables);
					thisObj.$el.find('#dropoff-product-list tbody').append(productItemTemplate);
				});
				thisObj.$el.find('#dropoff-product-list tfoot .total-bales').text(this.addCommaToNumber(dropoffProductsBalesTotal.toString()));
				thisObj.$el.find('#dropoff-product-list tfoot .total-pounds').text(this.addCommaToNumber(dropoffProductsPoundsTotal.toFixed(2)));
				thisObj.$el.find('#dropoff-product-list tfoot .total-net-tons').text(this.addCommaToNumber(dropoffProductsNetTotal.toFixed(4)));
			}
		},
		
		events: {
			'click #go-to-previous-page': 'goToPreviousPage',
			'click .close-weight-ticket': 'showCloseWeightTicketConfirmationWindow',
		},
		
		showCloseWeightTicketConfirmationWindow: function (ev) {
			this.initConfirmationWindow('Are you sure you want to close this weight ticket?',
										'confirm-close-wt',
										'Close Weight Ticket',
										'Close Weight Ticket',
										false);
			this.showConfirmationWindow();
			
			return false;
		},
	});

	return WeightInfoView;
});