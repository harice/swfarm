define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/salesorder/SalesOrderModel',
	'models/salesorder/SOScheduleModel',
	'models/salesorder/SOWeightInfoModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/salesorder/weightInfoViewTemplate.html',
	'text!templates/salesorder/weightInfoViewProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			SalesOrderModel,
			SOScheduleModel,
			SOWeightInfoModel,
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
			this.soId = option.soId;
			this.schedId = option.schedId;
			this.h1Title = 'Weight Info';
			this.h1Small = 'view';
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generateSOTabs(this.soId, 3)}));
			
			this.salesOrderModel = new SalesOrderModel({id:this.soId});
			this.salesOrderModel.on('change', function() {
				thisObj.soScheduleModel.runFetch();
				thisObj.off('change');
			});
			
			this.soScheduleModel = new SOScheduleModel({id:this.schedId});
			this.soScheduleModel.on('change', function() {
				thisObj.model.runFetch();
				thisObj.off('change');
			});
			
			this.model = new SOWeightInfoModel({id:this.schedId});
			this.model.on('change', function() {
				if(thisObj.subContainerExist()) {
					/*if(typeof this.get('weightTicketNumber') === 'undefined') {console.log('here here');
						Global.getGlobalVars().app_router.navigate(Const.URL.SOWEIGHTINFO+'/'+thisObj.soId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD, {trigger: true});}
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
			this.salesOrderModel.runFetch();
			Backbone.View.prototype.refreshTitle('Weight Info','view');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				pickup_weight_info_edit_url: '#/'+Const.URL.SOWEIGHTINFO+'/'+thisObj.soId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT+'/'+Const.WEIGHTINFO.PICKUP,
				pickup_weight_info_add_url: '#/'+Const.URL.SOWEIGHTINFO+'/'+thisObj.soId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD+'/'+Const.WEIGHTINFO.PICKUP,
				dropoff_weight_info_edit_url: '#/'+Const.URL.SOWEIGHTINFO+'/'+thisObj.soId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT+'/'+Const.WEIGHTINFO.DROPOFF,
				dropoff_weight_info_add_url: '#/'+Const.URL.SOWEIGHTINFO+'/'+thisObj.soId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD+'/'+Const.WEIGHTINFO.DROPOFF,
				previous_so_sched_url: '#/'+Const.URL.DELIVERYSCHEDULE+'/'+this.soId,
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
			
			var dateAndTime = this.convertDateFormat(this.soScheduleModel.get('scheduledate'), this.dateFormatDB, this.dateFormat, '-')
								+' '+this.soScheduleModel.get('scheduletimeHour')
								+':'+this.soScheduleModel.get('scheduletimeMin')
								+' '+this.soScheduleModel.get('scheduletimeAmPm');
			
			this.$el.find('#so-number').val(this.salesOrderModel.get('order_number'));
			this.$el.find('#producer').val(this.salesOrderModel.get('account').name);
			this.$el.find('#date-and-time').val(dateAndTime);
			this.$el.find('#weight-ticket-no').val(this.model.get('weightTicketNumber'));
			this.$el.find('#loading-ticket-no').val(this.model.get('loadingTicketNumber'));
			
			if(pickupInfo != null) {
				this.$el.find('#pickup-fields').show();
				if(typeof pickupInfo.scaler_account[0] != 'undefined' && typeof pickupInfo.scaler_account[0].name != 'undefined' && pickupInfo.scaler_account[0].name != null)
					this.$el.find('#pickup-info .scale-account').val(pickupInfo.scaler_account[0].name);
				if(typeof pickupInfo.scale != 'undefined' && pickupInfo.scale != null && typeof pickupInfo.scale.name != 'undefined' && pickupInfo.scale.name != null)
					this.$el.find('#pickup-info .scale-name').val(pickupInfo.scale.name);
				if(typeof pickupInfo.fee != 'undefined' && pickupInfo.fee != null)
					this.$el.find('#pickup-info .fee').val(this.addCommaToNumber(pickupInfo.fee));
				if(typeof pickupInfo.bales != 'undefined' && pickupInfo.bales != null)
					this.$el.find('#pickup-info .bales').val(this.addCommaToNumber(pickupInfo.bales));
				if(typeof pickupInfo.gross != 'undefined' && pickupInfo.gross != null)
					this.$el.find('#pickup-info .gross').val(this.addCommaToNumber(pickupInfo.gross));
				if(typeof pickupInfo.tare != 'undefined' && pickupInfo.tare != null)
					this.$el.find('#pickup-info .tare').val(this.addCommaToNumber(pickupInfo.tare));
					
				if(typeof pickupInfo.gross != 'undefined' && pickupInfo.gross != null && typeof pickupInfo.tare != 'undefined' && pickupInfo.tare != null) {
					var pickupNet = parseFloat(pickupInfo.gross) - parseFloat(pickupInfo.tare);
					this.$el.find('#pickup-info .net').text(this.addCommaToNumber(pickupNet.toFixed(4)));
				}
				
				var pickupProductsBalesTotal = 0;
				var pickupProductsPoundsTotal = 0;
				var pickupProductsNetTotal = 0;
				_.each(pickupInfo.weightticketproducts, function (product) {
					
					var net = (typeof product.pounds != 'undefined' && product.pounds != null)? parseFloat(product.pounds) * Const.LB2TON : 0;
					pickupProductsNetTotal += net;
					var bales = (typeof product.bales != 'undefined' && product.bales != null)? parseFloat(product.bales) : 0;
					pickupProductsBalesTotal += parseFloat(bales);
					var pounds = (typeof product.pounds != 'undefined' && product.pounds != null)? parseFloat(product.pounds) : 0;
					pickupProductsPoundsTotal += pounds;
					
					var variables = {
						stack_number: (typeof product.transportscheduleproduct.productorder.stacknumber != 'undefined' && product.transportscheduleproduct.productorder.stacknumber != null)? product.transportscheduleproduct.productorder.stacknumber : '',
						name: (typeof product.transportscheduleproduct.productorder.product.name != 'undefined' && product.transportscheduleproduct.productorder.product.name != null)? product.transportscheduleproduct.productorder.product.name : 0,
						bales: thisObj.addCommaToNumber(bales),
						pounds: thisObj.addCommaToNumber(pounds),
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
				if(typeof dropoffInfo.scaler_account[0] != 'undefined' && typeof dropoffInfo.scaler_account[0].name != 'undefined' && dropoffInfo.scaler_account[0].name != null)
					this.$el.find('#pickup-info .scale-account').val(dropoffInfo.scaler_account[0].name);
				if(typeof dropoffInfo.scale != 'undefined' && dropoffInfo.scale != null && typeof dropoffInfo.scale.name != 'undefined' && dropoffInfo.scale.name != null)
					this.$el.find('#pickup-info .scale-name').val(dropoffInfo.scale.name);
				if(typeof dropoffInfo.fee != 'undefined' && dropoffInfo.fee != null)
					this.$el.find('#pickup-info .fee').val(this.addCommaToNumber(dropoffInfo.fee));
				if(typeof dropoffInfo.bales != 'undefined' && dropoffInfo.bales != null)
					this.$el.find('#pickup-info .bales').val(this.addCommaToNumber(dropoffInfo.bales));
				if(typeof dropoffInfo.gross != 'undefined' && dropoffInfo.gross != null)
					this.$el.find('#pickup-info .gross').val(this.addCommaToNumber(dropoffInfo.gross));
				if(typeof dropoffInfo.tare != 'undefined' && dropoffInfo.tare != null)
					this.$el.find('#pickup-info .tare').val(this.addCommaToNumber(dropoffInfo.tare));
					
				if(typeof dropoffInfo.gross != 'undefined' && dropoffInfo.gross != null && typeof dropoffInfo.tare != 'undefined' && dropoffInfo.tare != null) {
					var pickupNet = parseFloat(dropoffInfo.gross) - parseFloat(dropoffInfo.tare);
					this.$el.find('#pickup-info .net').text(this.addCommaToNumber(pickupNet.toFixed(4)));
				}
				
				var dropoffProductsBalesTotal = 0;
				var dropoffProductsPoundsTotal = 0;
				var dropoffProductsNetTotal = 0;
				_.each(dropoffInfo.weightticketproducts, function (product) {
					
					var net = (typeof product.pounds != 'undefined' && product.pounds != null)? parseFloat(product.pounds) * Const.LB2TON : 0;
					dropoffProductsNetTotal += net;
					var bales = (typeof product.bales != 'undefined' && product.bales != null)? parseFloat(product.bales) : 0;
					dropoffProductsBalesTotal += parseFloat(bales);
					var pounds = (typeof product.pounds != 'undefined' && product.pounds != null)? parseFloat(product.pounds) : 0;
					dropoffProductsPoundsTotal += pounds;
					
					var variables = {
						stack_number: (typeof product.transportscheduleproduct.productorder.stacknumber != 'undefined' && product.transportscheduleproduct.productorder.stacknumber != null)? product.transportscheduleproduct.productorder.stacknumber : '',
						name: (typeof product.transportscheduleproduct.productorder.product.name != 'undefined' && product.transportscheduleproduct.productorder.product.name != null)? product.transportscheduleproduct.productorder.product.name : 0,
						bales: thisObj.addCommaToNumber(bales),
						pounds: thisObj.addCommaToNumber(pounds),
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