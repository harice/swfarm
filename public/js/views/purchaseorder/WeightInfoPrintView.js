define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/PrintView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/purchaseorder/PurchaseOrderModel',
	'models/purchaseorder/POScheduleModel',
	'models/purchaseorder/POWeightInfoModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderTabbingTemplate.html',
	'text!templates/weightinfo/weightInfoPrintTemplate.html',
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

	var WeightInfoPrintView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			this.initSubContainer();
			
			var thisObj = this;
			this.poId = option.poId;
			this.schedId = option.schedId;
			this.h1Title = 'Weight Info';
			this.h1Small = 'view';
			
			this.subContainer.html(_.template(purchaseOrderTabbingTemplate, {'tabs':this.generateSOTabs(this.poId, 3)}));
			
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
					thisObj.displayForm();
					thisObj.supplyWeightInfoData();
				}
				
				this.off('change');
			});
		},
		
		render: function(){
            $("#cl-sidebar").hide();
            $(".tab-container").hide();
            $(".back-to-top").hide();
            $(".user-nav li").hide();
            $(".user-nav").append('<li><button class="btn btn-default" style="margin-top: 4px;">Back to Previous Page</button></li>');
            
//            $("body").addClass("print");
            
			this.purchaseOrderModel.runFetch();
			Backbone.View.prototype.refreshTitle('Weight Info','view');
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
                _: _,
				pickup_weight_info_edit_url: '#/'+Const.URL.SOWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT+'/'+Const.WEIGHTINFO.PICKUP,
				pickup_weight_info_add_url: '#/'+Const.URL.SOWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD+'/'+Const.WEIGHTINFO.PICKUP,
				dropoff_weight_info_edit_url: '#/'+Const.URL.SOWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.EDIT+'/'+Const.WEIGHTINFO.DROPOFF,
				dropoff_weight_info_add_url: '#/'+Const.URL.SOWEIGHTINFO+'/'+thisObj.poId+'/'+thisObj.schedId+'/'+Const.CRUD.ADD+'/'+Const.WEIGHTINFO.DROPOFF,
				previous_so_sched_url: '#/'+Const.URL.DELIVERYSCHEDULE+'/'+this.poId,
        
                weightticket : this.model,
                order : this.purchaseOrderModel,
                schedule : this.poScheduleModel
			};
            
            _.extend(innerTemplateVariables,Backbone.View.prototype.helpers);
			
			if((!this.model.get('status') || (this.model.get('status') && this.model.get('status').name.toLowerCase() != Const.STATUS.CLOSED)) && 
				this.purchaseOrderModel.get('status').name.toLowerCase() == Const.STATUS.OPEN)
                innerTemplateVariables['editable'] = true;
			
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
			
			this.$el.find('#so-number').val(this.purchaseOrderModel.get('order_number'));
			this.$el.find('#producer').val(this.purchaseOrderModel.get('account').name);
			this.$el.find('#weight-ticket-no').val(this.model.get('weightTicketNumber'));
			this.$el.find('#loading-ticket-no').val(this.model.get('loadingTicketNumber'));
			
			if(pickupInfo != null) {
				this.$el.find('#pickup-fields').show();
				if(typeof pickupInfo.scaler_account != 'undefined' && typeof pickupInfo.scaler_account.name != 'undefined' && pickupInfo.scaler_account.name != null)
					this.$el.find('#pickup-info .scale-account').val(pickupInfo.scaler_account.name);
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
					// thisObj.$el.find('#pickup-product-list tbody').append(productItemTemplate);
				});
				thisObj.$el.find('#pickup-product-list tfoot .total-bales').text(this.addCommaToNumber(pickupProductsBalesTotal.toString()));
				thisObj.$el.find('#pickup-product-list tfoot .total-pounds').text(this.addCommaToNumber(pickupProductsPoundsTotal.toFixed(2)));
				thisObj.$el.find('#pickup-product-list tfoot .total-net-tons').text(this.addCommaToNumber(pickupProductsNetTotal.toFixed(4)));
			}
			
			if(dropoffInfo != null) {
				this.$el.find('#dropoff-fields').show();
				if(typeof dropoffInfo.scaler_account != 'undefined' && typeof dropoffInfo.scaler_account.name != 'undefined' && dropoffInfo.scaler_account.name != null)
					this.$el.find('#dropoff-info .scale-account').val(dropoffInfo.scaler_account.name);
				if(typeof dropoffInfo.scale != 'undefined' && dropoffInfo.scale != null && typeof dropoffInfo.scale.name != 'undefined' && dropoffInfo.scale.name != null)
					this.$el.find('#dropoff-info .scale-name').val(dropoffInfo.scale.name);
				if(typeof dropoffInfo.fee != 'undefined' && dropoffInfo.fee != null)
					this.$el.find('#dropoff-info .fee').val(this.addCommaToNumber(dropoffInfo.fee));
				if(typeof dropoffInfo.bales != 'undefined' && dropoffInfo.bales != null)
					this.$el.find('#dropoff-info .bales').val(this.addCommaToNumber(dropoffInfo.bales));
				if(typeof dropoffInfo.gross != 'undefined' && dropoffInfo.gross != null)
					this.$el.find('#dropoff-info .gross').val(this.addCommaToNumber(dropoffInfo.gross));
				if(typeof dropoffInfo.tare != 'undefined' && dropoffInfo.tare != null)
					this.$el.find('#dropoff-info .tare').val(this.addCommaToNumber(dropoffInfo.tare));
					
				if(typeof dropoffInfo.gross != 'undefined' && dropoffInfo.gross != null && typeof dropoffInfo.tare != 'undefined' && dropoffInfo.tare != null) {
					var pickupNet = parseFloat(dropoffInfo.gross) - parseFloat(dropoffInfo.tare);
					this.$el.find('#dropoff-info .net').text(this.addCommaToNumber(pickupNet.toFixed(4)));
				}
				
				var dropoffProductsBalesTotal = 0;
				var dropoffProductsPoundsTotal = 0;
				var dropoffProductsNetTotal = 0;
				_.each(dropoffInfo.weightticketproducts, function (product) {
					
					var net = (typeof product.pounds != 'undefined' && product.pounds != null)? parseFloat(product.pounds) * Const.LB2TON : 0;
					dropoffProductsNetTotal += net;
					var bales = (typeof product.bales != 'undefined' && product.bales != null)? parseInt(product.bales) : 0;
					dropoffProductsBalesTotal += bales;
					var pounds = (typeof product.pounds != 'undefined' && product.pounds != null)? parseFloat(product.pounds) : 0;
					dropoffProductsPoundsTotal += pounds;
					
					var variables = {
						stack_number: (typeof product.transportscheduleproduct.productorder.stacknumber != 'undefined' && product.transportscheduleproduct.productorder.stacknumber != null)? product.transportscheduleproduct.productorder.stacknumber : '',
						name: (typeof product.transportscheduleproduct.productorder.product.name != 'undefined' && product.transportscheduleproduct.productorder.product.name != null)? product.transportscheduleproduct.productorder.product.name : 0,
						bales: thisObj.addCommaToNumber(bales),
						pounds: thisObj.addCommaToNumber(pounds.toFixed(2)),
						net: net.toFixed(4),
					};
					
					var productItemTemplate = _.template(weightInfoViewProductItemTemplate, variables);
					// thisObj.$el.find('#dropoff-product-list tbody').append(productItemTemplate);
				});
				thisObj.$el.find('#dropoff-product-list tfoot .total-bales').text(this.addCommaToNumber(dropoffProductsBalesTotal.toString()));
				thisObj.$el.find('#dropoff-product-list tfoot .total-pounds').text(this.addCommaToNumber(dropoffProductsPoundsTotal.toFixed(2)));
				thisObj.$el.find('#dropoff-product-list tfoot .total-net-tons').text(this.addCommaToNumber(dropoffProductsNetTotal.toFixed(4)));
			}
		},
		
		events: {
			'click #go-to-previous-page': function() {
                this.goToPreviousPage();
                this.togglePrintElements();
            }
		},
                
        togglePrintElements: function() {
            $("#cl-sidebar").show();
            $(".tab-container").show();
            $(".back-to-top").show();
            $(".user-nav li").show();
        }
	});

	return WeightInfoPrintView;
});