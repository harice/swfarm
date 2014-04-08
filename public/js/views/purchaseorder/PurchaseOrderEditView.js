define([
	'backbone',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/purchaseorder/AddScheduleView',
	'models/purchaseorder/POModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/purchaseorder/purchaseOrderAddTemplate.html',
	'text!templates/purchaseorder/purchaseOrderProductItemTemplate.html',
	'global',
	'constant',
], function(
			Backbone,
			Validate,
			TextFormatter,
			PhoneNumber,
			AddScheduleView,
			POModel,
			contentTemplate,
			purchaseOrderAddTemplate,
			purchaseOrderProductItemTemplate,
			Global,
			Const
){

	var PurchaseOrderAddView = Backbone.View.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function(option) {
			var thisObj = this;
			
			this.options = {
				bidProductFieldClone: null,
				bidProductFieldCounter: 0,
				bidProductFieldClass: ['product', 'unitprice'],
				bidProductFieldClassRequired: ['unitprice'],
				bidProductFieldSeparator: '.',
			};
			
			this.model = new POModel({id:option.id});
			this.model.on("change", function() {
				console.log(this);
				thisObj.displayForm();
				this.off("change");
			});
		},
		
		render: function(){
			this.model.runFetch();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'po_url' : '#/'+Const.URL.PO
			};
			var innerTemplate = _.template(purchaseOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Edit Purchase Order",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			var validate = $('#POPropertiesForm').validate({
				submitHandler: function(form) {
					//console.log($(form).serializeObject());
					var data = thisObj.formatFormField($(form).serializeObject());
					//console.log(data);
				},
			});
			
			var validate = $('#POProductForm').validate({
				submitHandler: function(form) {
					//console.log($(form).serializeObject());
					var data = thisObj.formatFormField($(form).serializeObject());
					//console.log(data);
				},
			});
			
			this.supplyPOData();
			
			this.initPickUpPeriodCalendar();
			
			var addScheduleView = new AddScheduleView();
			addScheduleView.render();
		},
		
		supplyPOData: function () {
			var thisObj = this;
			var address = this.model.get('address');
			var bidProducts = this.model.get('bidproduct');
			
			this.$el.find('#po-number').text(this.model.get('ponumber'));
			this.$el.find('#po-status').text(this.model.get('po_status'));
			this.$el.find('#po-destination').text(this.model.get('destination').destination);
			this.$el.find('#po-producer').text(this.model.get('account').name);
			this.$el.find('#po-address-type').text(address.address_type[0].name);
			this.$el.find('#po-address-street').text(address.street);
			this.$el.find('#po-address-state').text(address.addressstates[0].state);
			this.$el.find('#po-address-city').text(address.addresscity[0].city);
			this.$el.find('#po-address-zip-code').text(address.zipcode);
			this.$el.find('#po-date').text(this.model.get('po_date').split(' ')[0]);
			
			_.each(bidProducts, function (bidProduct) {
				var bidProductFields = thisObj.addBidProduct();
				
				bidProductFields.find('.id').val(bidProduct.id);
				bidProductFields.find('.po-product').text(bidProduct.product[0].name);
				//bidProductFields.find('.po-product-desc').text(bidProduct.description);
				bidProductFields.find('.po-product-stacknumber').text(bidProduct.stacknumber);
				bidProductFields.find('.po-product-tons').text(bidProduct.tons);
				bidProductFields.find('.po-product-bales').text(bidProduct.bales);
				bidProductFields.find('.unitprice').val('0.00');
				bidProductFields.find('.po-product-amount').text('0.00');
				
				if(bidProduct.unitprice != null) {
					bidProductFields.find('.unitprice').val(bidProduct.unitprice);
					thisObj.computeAmount(bidProduct.unitprice, bidProduct.tons, bidProductFields.find('.po-product-amount'));
				}
				
				
				
				
			});
			
			this.$el.find('.notes').val(this.model.get('notes'));
		},
		
		initPickUpPeriodCalendar: function () {
			this.$el.find('#start-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			});
			
			this.$el.find('#end-date .input-group.date').datepicker({
				orientation: "top left",
				autoclose: true,
				clearBtn: true,
				todayHighlight: true,
				format: 'yyyy-mm-dd',
			});
		},
		
		events: {
			'blur .unitprice': 'onBlurUnitPrice',
			'keyup .unitprice': 'onKeyUpUnitPrice',
		},
		
		hasProduct: function () {
			return (this.$el.find('#bid-product-list tbody .product-item').length)? true : false;
		},
		
		addBidProduct: function () {
			var clone = null;
				
			if(!this.hasProduct())
				this.$el.find('#bid-product-list tbody').empty();
			
			if(this.options.bidProductFieldClone == null) {
				var bidProductTemplate = _.template(purchaseOrderProductItemTemplate, {});
				
				this.$el.find('#bid-product-list tbody').append(bidProductTemplate);
				var bidProductItem = this.$el.find('#bid-product-list tbody').find('.product-item:first-child');
				this.options.bidProductFieldClone = bidProductItem.clone();
				this.addIndexToBidProductFields(bidProductItem);
				clone = bidProductItem;
			}
			else {
				clone = this.options.bidProductFieldClone.clone();
				this.addIndexToBidProductFields(clone);
				this.$el.find('#bid-product-list tbody').append(clone);
			}
				
			this.addValidationToBidProduct();
			
			return clone;
		},
		
		addValidationToBidProduct: function () {
			var thisObj = this;
			var bidProductFieldClassRequired = this.options.bidProductFieldClassRequired;
			for(var i=0; i < bidProductFieldClassRequired.length; i++) {
				$('.'+bidProductFieldClassRequired[i]).each(function() {
					$(this).rules('add', {required: true});
				});
			}
		},
		
		addIndexToBidProductFields: function (bidProductItem) {
			var bidProductFieldClass = this.options.bidProductFieldClass;
			for(var i=0; i < bidProductFieldClass.length; i++) {
				var field = bidProductItem.find('.'+bidProductFieldClass[i]);
				var name = field.attr('name');
				field.attr('name', name + this.options.bidProductFieldSeparator + this.options.bidProductFieldCounter);
			}
			
			this.options.bidProductFieldCounter++;
		},
		
		onBlurUnitPrice: function (ev) {
			var field = $(ev.target);
			var unitPrice = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var tonsField = field.closest('.product-item').find('.po-product-tons');
			var tons = (!isNaN(parseFloat(tonsField.text())))? parseFloat(tonsField.text()) : 0;
			
			field.val(unitPrice.toFixed(2));
			this.computeAmount(unitPrice, tons, field.closest('.product-item').find('.po-product-amount'));
		},
		
		onKeyUpUnitPrice: function (ev) {
			var field = $(ev.target);
			var unitPrice = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var tonsField = field.closest('.product-item').find('.po-product-tons');
			var tons = (!isNaN(parseFloat(tonsField.text())))? parseFloat(tonsField.text()) : 0;
			
			this.computeAmount(unitPrice, tons, field.closest('.product-item').find('.po-product-amount'));
		},
		
		computeAmount: function (unitPrice, tons, unitePriceField) {
			var ammount = 0;
			ammount = tons * unitPrice;
			unitePriceField.text(ammount.toFixed(2));
			
			var amountotal = 0;
			this.$el.find('.po-product-amount').each(function () {
				amountotal += parseFloat($(this).text());
			});
			
			this.$el.find('.amounttotal').text(amountotal.toFixed(2));
		},
	});

  return PurchaseOrderAddView;
  
});