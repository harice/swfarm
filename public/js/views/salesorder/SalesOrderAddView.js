define([
	'backbone',
	'views/base/AppView',
	'jqueryui',
	'jqueryvalidate',
	'jquerytextformatter',
	'jqueryphonenumber',
	'views/autocomplete/CustomAutoCompleteView',
	'collections/account/AccountCustomerCollection',
	'collections/salesorder/OriginCollection',
	'collections/salesorder/NatureOfSaleCollection',
	'collections/product/ProductCollection',
	'models/salesorder/SalesOrderModel',
	'text!templates/layout/contentTemplate.html',
	'text!templates/salesorder/salesOrderAddTemplate.html',
	'text!templates/salesorder/salesOrderProductItemTemplate.html',
	'text!templates/salesorder/salesOrderOriginTemplate.html',
	'text!templates/salesorder/salesOrderNatureOfSaleTemplate.html',
	'global',
	'constant',
], function(Backbone,
			AppView,
			JqueryUI,
			Validate,
			TextFormatter,
			PhoneNumber,
			CustomAutoCompleteView,
			AccountCustomerCollection,
			OriginCollection,
			NatureOfSaleCollection,
			ProductCollection,
			SalesOrderModel,
			contentTemplate,
			salesOrderAddTemplate,
			productItemTemplate,
			salesOrderOriginTemplate,
			salesOrderNatureOfSaleTemplate,
			Global,
			Const
){

	var SalesOrderAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		customerAutoCompleteView: null,
		
		initialize: function() {
			var thisObj = this;
			
			this.productAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'description', 'productname', 'stacknumber', 'unitprice', 'tons', 'bales'],
				productFieldClassRequired: ['productname', 'stacknumber', 'unitprice', 'tons', 'bales'],
				productFieldExempt: ['productname'],
				productFieldSeparator: '.',
			};
			
			this.originCollection = new OriginCollection();
			this.originCollection.on('sync', function() {	
				thisObj.natureOfSaleCollection.getModels();
				this.off('sync');
			});
			this.originCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.natureOfSaleCollection = new NatureOfSaleCollection();
			this.natureOfSaleCollection.on('sync', function() {
				thisObj.productCollection.getAllModel();
				this.off('sync');
			});
			this.natureOfSaleCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				_.each(this.models, function (productModels) {
					thisObj.productAutoCompletePool.push({
						label:productModels.get('name'),
						value:productModels.get('name'),
						id:productModels.get('id'),
						desc:productModels.get('description'),
					});
				});
				thisObj.displayForm();
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.originCollection.getModels();
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				'so_url' : '#/'+Const.URL.SO,
			};
			var innerTemplate = _.template(salesOrderAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: "Sales Order",
				h1_small: "add",
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.$el.html(compiledTemplate);
			
			var validate = $('#soForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					
					console.log(data);
					
					var salesOrderModel = new SalesOrderModel(data);
					
					salesOrderModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Global.getGlobalVars().app_router.navigate(Const.URL.SO, {trigger: true});
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: salesOrderModel.getAuth(),
						}
					);
				},
				errorPlacement: function(error, element) {
					if(element.hasClass('form-date')) {
						element.closest('.calendar-cont').siblings('.error-msg-cont').html(error);
					}
					else if(element.hasClass('price')) {
						element.closest('.input-group').siblings('.error-msg-cont').html(error);
					}
					else {
						error.insertAfter(element);
					}
				},
			});
			
			this.addProduct();
			this.generateOrigin();
			this.generateNatureOfSale();
			this.initCustomerAutocomplete();
			this.initCalendar();
		},
		
		generateOrigin: function () {
			var originTemplate = _.template(salesOrderOriginTemplate, {'origins': this.originCollection.models});
			this.$el.find('#so-origin').html(originTemplate);
			this.$el.find('#so-origin .radio-inline:first-child input[type="radio"]').attr('checked', true);
		},
		
		generateNatureOfSale: function () {
			var NOSTemplate = _.template(salesOrderNatureOfSaleTemplate, {'natureOfSales': this.natureOfSaleCollection.models});
			this.$el.find('#so-nos').html(NOSTemplate);
			this.$el.find('#so-nos .radio-inline:first-child input[type="radio"]').attr('checked', true);
		},
		
		initCustomerAutocomplete: function () {
			var thisObj = this;
			
			if(this.customerAutoCompleteView != null)
				this.customerAutoCompleteView.deAlloc();
			
			var accountCustomerCollection = new AccountCustomerCollection();
			this.customerAutoCompleteView = new CustomAutoCompleteView({
                input: $('#customer'),
				hidden: $('#customer-id'),
                collection: accountCustomerCollection,
				fields: ['address'],
            });
			
			this.customerAutoCompleteView.onSelect = function (model) {
				var address = model.get('address');
				thisObj.$el.find('#street').val(address[0].street);
				thisObj.$el.find('#state').val(address[0].address_states[0].state);
				thisObj.$el.find('#city').val(address[0].address_city[0].city);
				thisObj.$el.find('#zipcode').val(address[0].zipcode);
			};
			
			this.customerAutoCompleteView.typeInCallback = function (result) {
				var address = result.address;
				thisObj.$el.find('#street').val(address[0].street);
				thisObj.$el.find('#state').val(address[0].address_states[0].state);
				thisObj.$el.find('#city').val(address[0].address_city[0].city);
				thisObj.$el.find('#zipcode').val(address[0].zipcode);
			},
			
			this.customerAutoCompleteView.typeInEmptyCallback = function () {
				thisObj.$el.find('#street').val('');
				thisObj.$el.find('#state').val('');
				thisObj.$el.find('#city').val('');
				thisObj.$el.find('#zipcode').val('');
			},
			
			this.customerAutoCompleteView.render();
		},
		
		initCalendar: function () {
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
		
		addProduct: function () {
			
			if(this.options.productFieldClone == null) {
				var productTemplate = _.template(productItemTemplate, {});
				
				this.$el.find('#product-list tbody').append(productTemplate);
				var productItem = this.$el.find('#product-list tbody').find('.product-item:first-child');
				this.options.productFieldClone = productItem.clone();
				this.initProductAutocomplete(productItem);
				this.addIndexToProductFields(productItem);
			}
			else {
				var clone = this.options.productFieldClone.clone();
				this.initProductAutocomplete(clone);
				this.addIndexToProductFields(clone);
				this.$el.find('#product-list tbody').append(clone);
			}
				
			this.addValidationToProduct();
		},
		
		initProductAutocomplete: function (productItem) {
			var thisObj = this;
			
			var products = this.productAutoCompletePool;
			
			productItem.find('.productname').autocomplete({
				source:products,
				select: function (ev, ui) {
					var productField = $(ev.target);
					productField.siblings('.product_id').val(ui.item.id);
					productField.val(ui.item.label);
					return false;
				},
			});
		},
		
		addIndexToProductFields: function (bidProductItem) {
			var productFieldClass = this.options.productFieldClass;
			for(var i=0; i < productFieldClass.length; i++) {
				var field = bidProductItem.find('.'+productFieldClass[i]);
				var name = field.attr('name');
				field.attr('name', name + this.options.productFieldSeparator + this.options.productFieldCounter);
			}
			
			this.options.productFieldCounter++;
		},
		
		addValidationToProduct: function () {
			var thisObj = this;
			var productFieldClassRequired = this.options.productFieldClassRequired;
			for(var i=0; i < productFieldClassRequired.length; i++) {
				$('.'+productFieldClassRequired[i]).each(function() {
					$(this).rules('add', {required: true});
				});
			}
		},
		
		formatFormField: function (data) {
			var formData = {products:[]};
			var productFieldClass = this.options.productFieldClass;
			
			for(var key in data) {
				if(typeof data[key] !== 'function'){
					var value = data[key];
					var arrayKey = key.split(this.options.productFieldSeparator);
					
					if(arrayKey.length < 2)
						formData[key] = value;
					else {
						if(arrayKey[0] == productFieldClass[0]) {
							var index = arrayKey[1];
							var arrayBidProductFields = {};
							
							for(var i = 0; i < productFieldClass.length; i++) {
								if(this.options.productFieldExempt.indexOf(productFieldClass[i]) < 0)
									arrayBidProductFields[productFieldClass[i]] = data[productFieldClass[i]+this.options.productFieldSeparator+index];
							}
								
							formData.products.push(arrayBidProductFields);
						}
					}
				}
			}
			
			return formData;
		},
		
		events: {
			'click #add-so-product': 'addProduct',
			'click .remove-product': 'removeProduct',
			'blur .productname': 'validateProduct',
			'blur .unitprice': 'onBlurUnitPrice',
			'keyup .unitprice': 'onKeyUpUnitPrice',
			'keyup .tons': 'onKeyUpTons',
		},
		
		removeProduct: function (ev) {
			$(ev.target).closest('tr').remove();
			
			if(!this.hasProduct())
				this.addProduct();
		},
		
		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
		},
		
		validateProduct: function (ev) {
			var field = $(ev.target);
			var name = field.val();
			var id = field.siblings('.product_id').val();
			var product = this.isInProductAutoCompletePool(name);
			
			if(product === false) {
				this.emptyProductFields(field);
			}
			else {
				field.val(product.name);
				field.siblings('.product_id').val(product.id);
			}
		},
		
		isInProductAutoCompletePool: function (value) {
			for(var i = 0; i < this.productAutoCompletePool.length; i++) {
				if(this.productAutoCompletePool[i].value.toLowerCase() == value.toLowerCase()) {
					return {id:this.productAutoCompletePool[i].id, name:this.productAutoCompletePool[i].value};
				}
			}
			return false;
		},
		
		emptyProductFields: function (field) {
			field.val('');
			field.siblings('.product_id').val('');
		},
		
		onBlurUnitPrice: function (ev) {
			var field = $(ev.target);
			var bidPrice = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var tonsField = field.closest('.product-item').find('.tons');
			var tons = (!isNaN(parseFloat(tonsField.val())))? parseFloat(tonsField.val()) : 0;
			
			field.val(bidPrice);
			this.toFixedValue(field, 2)
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		onKeyUpUnitPrice: function (ev) {
			var field = $(ev.target);
			var bidPrice = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var tonsField = field.closest('.product-item').find('.tons');
			var tons = (!isNaN(parseFloat(tonsField.val())))? parseFloat(tonsField.val()) : 0;
			
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		onKeyUpTons: function (ev) {
			var field = $(ev.target);
			
			var tons = (!isNaN(parseFloat(field.val())))? parseFloat(field.val()) : 0;
			var bidPriceField = field.closest('.product-item').find('.unitprice');
			var bidPrice = (!isNaN(parseFloat(bidPriceField.val())))? parseFloat(bidPriceField.val()) : 0;
			
			this.computeUnitePrice(bidPrice, tons, field.closest('.product-item').find('.unit-price'));
		},
		
		computeUnitePrice: function (bidPrice, tonsOrBales, unitePriceField) {
			var unitPrice = 0;
			unitPrice = tonsOrBales * bidPrice;
			unitePriceField.val(unitPrice.toFixed(2));
		},
	});

  return SalesOrderAddView;
  
});