define([
	'backbone',
	'bootstrapdatepicker',
	'views/base/AppView',
	'jqueryvalidate',
	'jquerytextformatter',
	'models/inventory/InventoryModel',
	'collections/account/AccountCollection',
	'collections/product/ProductCollection',
	'collections/stack/LocationCollection',
	'collections/inventory/LocationTransactionTypeCollection',
	'collections/inventory/StackNumberCollection',
	'collections/salesorder/SalesOrderCollection',
	'text!templates/layout/contentTemplate.html',
	'text!templates/inventory/inventoryAddTemplate.html',
	'text!templates/inventory/inventoryProductItemTemplate.html',
	'global',
	'constant',
], function(Backbone,
			DatePicker,
			AppView,
			Validate,
			TextFormatter,
			InventoryModel,
			AccountCollection,
			ProductCollection,
			LocationCollection,
			LocationTransactionTypeCollection,
			StackNumberCollection,
			SalesOrderCollection,
			contentTemplate,
			inventoryAddTemplate,
			inventoryProductItemTemplate,
			Global,
			Const
){

	var InventoryAddView = AppView.extend({
		el: $("#"+Const.CONTAINER.MAIN),
		
		initialize: function() {
			this.initSubContainer();
			var thisObj = this;
			this.truckerId = null;
			this.h1Title = 'Inventory';
			this.h1Small = 'add';
			
			this.stackNumberAutoCompletePool = [];
			this.options = {
				productFieldClone: null,
				productFieldCounter: 0,
				productFieldClass: ['product_id', 'stacknumber', 'sectionfrom_id', 'sectionto_id', 'bales', 'tons', 'price', 'id'],
				productFieldClassRequired: ['product_id', 'stacknumber', 'sectionfrom_id', 'sectionto_id', 'tons', 'price'],
				productFieldExempt: [],
				productFieldSeparator: '.',
				removeComma: ['tons', 'price'],
			};
			
			this.productCollection = new ProductCollection();
			this.productCollection.on('sync', function() {
				if(thisObj.subContainerExist())
					thisObj.displayForm();
				
				this.off('sync');
			});
			this.productCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.customerAccountCollection = new AccountCollection();
			this.customerAccountCollection.on('sync', function() {
				thisObj.productCollection.getAllModel();
				this.off('sync');
			});
			this.customerAccountCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.locationCollection = new LocationCollection();
			this.locationCollection.on('sync', function() {
				thisObj.customerAccountCollection.getCustomerAccounts();
				this.off('sync');
			});
			this.locationCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.locationTransactionTypeCollection = new LocationTransactionTypeCollection();
			this.locationTransactionTypeCollection.on('sync', function() {
				thisObj.locationCollection.getModels();
				this.off('sync');
			});
			this.locationTransactionTypeCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.stackNumberCollection = new StackNumberCollection();
			this.stackNumberCollection.on('sync', function() {
				_.each(this.models, function (stackNumberModel) {
					thisObj.stackNumberAutoCompletePool.push(stackNumberModel.get('stacknumber'));
				});
				
				thisObj.locationTransactionTypeCollection.getModels();
				this.off('sync');
			});
			this.stackNumberCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
			
			this.salesOrderCollection = new SalesOrderCollection();
			this.salesOrderCollection.on('sync', function() {
				thisObj.generateSO();
                thisObj.hideFieldThrobber('#returnedOrder_id');
			});
			this.salesOrderCollection.on('error', function(collection, response, options) {
				//this.off('error');
			});
			
			this.orderProductsCollection = new ProductCollection();
			this.orderProductsCollection.on('sync', function() {
				thisObj.generateOrderProductDropdown();
				//this.off('sync');
			});
			this.orderProductsCollection.on('error', function(collection, response, options) {
				this.off('error');
			});
		},
		
		render: function(){
			this.stackNumberCollection.getModels();
			Backbone.View.prototype.refreshTitle(this.h1Title,this.h1Small);
		},
		
		displayForm: function () {
			var thisObj = this;
			
			var innerTemplateVariables = {
				customer_account_list: this.getCustomerDropdown(),
			};
			
			if(this.truckerId != null)
				innerTemplateVariables['trucker_id'] = this.truckerId;
			
			var innerTemplate = _.template(inventoryAddTemplate, innerTemplateVariables);
			
			var variables = {
				h1_title: this.h1Title,
				h1_small: this.h1Small,
				sub_content_template: innerTemplate,
			};
			var compiledTemplate = _.template(contentTemplate, variables);
			this.subContainer.html(compiledTemplate);
			
			this.generateTransactionType();
			this.focusOnFirstField();
			this.initValidateForm();
			this.addProduct();
			
			this.otherInitializations();
		},
		
		initValidateForm: function () {
			var thisObj = this;
			
			var validate = $('#inventoryForm').validate({
				submitHandler: function(form) {
					var data = thisObj.formatFormField($(form).serializeObject());
					
					//console.log(data);
					
					var inventoryModel = new InventoryModel(data);
					
					inventoryModel.save(
						null, 
						{
							success: function (model, response, options) {
								thisObj.displayMessage(response);
								Backbone.history.history.back();
							},
							error: function (model, response, options) {
								if(typeof response.responseJSON.error == 'undefined')
									validate.showErrors(response.responseJSON);
								else
									thisObj.displayMessage(response);
							},
							headers: inventoryModel.getAuth(),
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
		},
		
		addProduct: function () {
			var clone = null;
			
			if(this.options.productFieldClone == null) {
				var productTemplateVars = {
					product_list:this.getProductDropdown(),
					location_list:this.getLocationDropdown(),
				};
				var productTemplate = _.template(inventoryProductItemTemplate, productTemplateVars);
				
				this.$el.find('#product-list tbody').append(productTemplate);
				var productItem = this.$el.find('#product-list tbody').find('.product-item:first-child');
				this.options.productFieldClone = productItem.clone();
				this.initStackNumberAutocomplete(productItem);
				this.addIndexToProductFields(productItem);
				clone = productItem;
			}
			else {
				var clone = this.options.productFieldClone.clone();
				this.initStackNumberAutocomplete(clone);
				this.addIndexToProductFields(clone);
				clone.find('.product_id').html(this.getProductDropdown());
				this.$el.find('#product-list tbody').append(clone);
			}
			
			this.toggleDisableLocation(clone);
			this.addValidationToProduct(clone);
			return clone;
		},
		
		getProductDropdown: function () { console.log('getProductDropdown');
			if(this.subContainer.find('#receipt-return').is(':checked') && this.subContainer.find('#returnedOrder_id').val() != '')
				return this.getOrderProductDropdown();
			else
				return this.getAllProductDropdown();
		},
		
		getLocationDropdown: function () {
			var dropDown = '<option value="">Select a location</option>';
			_.each(this.locationCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('locationName')+'</option>';
			});
			
			return dropDown;
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
		
		addValidationToProduct: function (clone) {
			var thisObj = this;
			var productFieldClassRequired = this.options.productFieldClassRequired;
			for(var i=0; i < productFieldClassRequired.length; i++) {
				var rules = {};
				var transactionType = $('#transactiontype_id option:selected').text().toLowerCase();
				
				if(productFieldClassRequired[i] == 'sectionfrom_id') {
					if(Const.INVENTORY.LOCATIONFROMREQUIRED.indexOf(transactionType) < 0)
						rules = {required: false};
					else
						rules = {required: true};
				}
				else if(productFieldClassRequired[i] == 'sectionto_id') {
					if(Const.INVENTORY.LOCATIONTOREQUIRED.indexOf(transactionType) < 0)
						rules = {required: false};
					else
						rules = {required: true};
				}
				else
					rules = {required: true};
				
				clone.find('.'+productFieldClassRequired[i]).each(function() {
					$(this).rules('add', rules);
				});
			}
		},
		
		initStackNumberAutocomplete: function (productItem) {
			var thisObj = this;
			
			var stackNumbers = this.stackNumberAutoCompletePool;
			
			productItem.find('.stacknumber').autocomplete({
				source:stackNumbers,
				messages: {
					noResults: '',
					results: function() {},
				}
				/*select: function (ev, ui) {
					var productField = $(ev.target);
					productField.siblings('.product_id').val(ui.item.id);
					productField.val(ui.item.label);
					return false;
				},*/
			});
		},
		
		changeValidation: function (element, rules) {
			element.each(function () {
				$(this).rules('add', rules);
			});
		},
		
		generateTransactionType: function () {
			var options = '';
			_.each(this.locationTransactionTypeCollection.models, function (model) {
				options += '<option value="'+model.get('id')+'">'+model.get('type')+'</option>';
			});
			
			this.$el.find('#transactiontype_id').append(options);
		},
		
		formatFormField: function (data) {
			var formData = {products:[]};
			var productFieldClass = this.options.productFieldClass;
			
			for(var key in data) {
				if(typeof data[key] !== 'function'){
					var value = data[key];
					var arrayKey = key.split(this.options.productFieldSeparator);
					
					if(arrayKey.length < 2)
						if(this.options.removeComma.indexOf(key) < 0)
							formData[key] = value;
						else
							formData[key] = this.removeCommaFromNumber(value);
					else {
						if(arrayKey[0] == productFieldClass[0]) {
							var index = arrayKey[1];
							var arrayProductFields = {};
							
							for(var i = 0; i < productFieldClass.length; i++) {
								if(this.options.productFieldExempt.indexOf(productFieldClass[i]) < 0) {
									var fieldValue = data[productFieldClass[i]+this.options.productFieldSeparator+index];
									if(!(productFieldClass[i] == 'id' && fieldValue == '')) {
										if(this.options.removeComma.indexOf(productFieldClass[i]) < 0)
											arrayProductFields[productFieldClass[i]] = fieldValue;
										else
											arrayProductFields[productFieldClass[i]] = this.removeCommaFromNumber(fieldValue);
									}
								}
							}
								
							formData.products.push(arrayProductFields);
						}
					}
				}
			}
			
			return formData;
		},
		
		events: {
			'click #add-product': 'addProduct',
			'click .remove-product': 'removeProduct',
			'keyup .tons': 'onKeyUpTons',
			'blur .tons': 'onBlurTon',
			'keyup .price': 'onKeyUpPrice',
			'blur .price': 'onBlurMoney',
			'change #transactiontype_id': 'onChangeTransactionType',
			'click #go-to-previous-page': 'goToPreviousPage',
			'click #delete-trucker': 'showConfirmationWindow',
			'click #confirm-delete-trucker': 'deleteTrucker',
			'keyup .bales': 'formatNumber',
			'change #receipt-return': 'onChangeReceiptReturn',
			'change #customer': 'onChangeCustomer',
			'change #returnedOrder_id': 'onChangeSO',
		},
		
		removeProduct: function (ev) {
			$(ev.target).closest('tr').remove();
			
			if(!this.hasProduct())
				this.addProduct();
		},
		
		hasProduct: function () {
			return (this.$el.find('#product-list tbody .product-item').length)? true : false;
		},
		
		onKeyUpTons: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 4);
			
			var tonsfield = $(ev.target);
			var tonsfieldVal = this.removeCommaFromNumber(tonsfield.val());
			var tons = (!isNaN(parseFloat(tonsfieldVal)))? parseFloat(tonsfieldVal) : 0;
			var priceField = tonsfield.closest('.product-item').find('.price');
			var priceFieldVal = this.removeCommaFromNumber(priceField.val());
			var price = (!isNaN(parseFloat(priceFieldVal)))? parseFloat(priceFieldVal) : 0;
			
			this.computeTotalPrice(price, tons, tonsfield.closest('.product-item').find('.total-price'));
		},
		
		onKeyUpPrice: function (ev) {
			this.fieldAddCommaToNumber($(ev.target).val(), ev.target, 2);
			
			var pricefield = $(ev.target);
			var pricefieldVal = this.removeCommaFromNumber(pricefield.val());
			var price = (!isNaN(parseFloat(pricefieldVal)))? parseFloat(pricefieldVal) : 0;
			var tonsField = pricefield.closest('.product-item').find('.tons');
			var tonsFieldVal = this.removeCommaFromNumber(tonsField.val());
			var tons = (!isNaN(parseFloat(tonsFieldVal)))? parseFloat(tonsFieldVal) : 0;
			
			this.computeTotalPrice(price, tons, pricefield.closest('.product-item').find('.total-price'));
		},
		
		computeTotalPrice: function (price, ton, totalPriceField) {
			var totalPrice = 0;
			totalPrice = ton * price;
			totalPriceField.val(this.addCommaToNumber(totalPrice.toFixed(2)));
		},
		
		onChangeTransactionType: function (ev) {
			var transactionType = $(ev.currentTarget).find('option:selected').text().toLowerCase();
			var transactionTypeId = parseInt($(ev.currentTarget).val());
			var fromRules = null;
			var toRules = null;
			
			this.toggleDisableLocation();
			
			if(Const.INVENTORY.LOCATIONFROMREQUIRED.indexOf(transactionType) < 0)
				fromRules = {required: false};
			else
				fromRules = {required: true};
			
			this.changeValidation($('.sectionfrom_id'), fromRules);
			
			if(Const.INVENTORY.LOCATIONTOREQUIRED.indexOf(transactionType) < 0)
				toRules = {required: false};
			else
				toRules = {required: true};
			
			this.changeValidation($('.sectionto_id'), toRules);
			
			if(transactionTypeId == Const.INVENTORY.TYPE.RECEIPT)
				this.subContainer.find('#receipt-return-cont').show();
			else {
				this.subContainer.find('#receipt-return-cont').hide();
				this.subContainer.find('#receipt-return').attr('checked', false).trigger('change');
			}
				
		},
		
		toggleDisableLocation: function (element) {
			var transactionType = $('#transactiontype_id option:selected').text().toLowerCase();
			
			if(element == null) {
				if(Const.INVENTORY.LOCATIONFROMREQUIRED.indexOf(transactionType) < 0)
					$('.sectionfrom_id').attr('disabled', true); 
				else
					$('.sectionfrom_id').attr('disabled', false); 
				
				if(Const.INVENTORY.LOCATIONTOREQUIRED.indexOf(transactionType) < 0)
					$('.sectionto_id').attr('disabled', true);
				else
					$('.sectionto_id').attr('disabled', false);
			}
			else {
				if(element.find('.sectionfrom_id').length && Const.INVENTORY.LOCATIONFROMREQUIRED.indexOf(transactionType) < 0)
					element.find('.sectionfrom_id').attr('disabled', true);
				
				if(element.find('.sectionto_id').length && Const.INVENTORY.LOCATIONTOREQUIRED.indexOf(transactionType) < 0)
					element.find('.sectionto_id').attr('disabled', true);
			}
		},
		
		onChangeReceiptReturn: function (ev) {
			if($(ev.currentTarget).is(':checked')) {
				this.subContainer.find('.return-fields').show();
				this.subContainer.find('#returnedOrder_id').attr('disabled', false);
			}
			else {
				this.subContainer.find('.return-fields').hide();
				this.subContainer.find('#customer').val('').trigger('change');
				this.subContainer.find('#returnedOrder_id').attr('disabled', true);
			}
		},
		
		getCustomerDropdown: function () {
			var dropDown = '';
			_.each(this.customerAccountCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			return dropDown;
		},
		
		onChangeCustomer: function (ev) {
			this.fetchSO($(ev.currentTarget).val());
		},
		
		fetchSO: function(accountId, so_id) {
			if(so_id != null)
				this.selectedSOId = so_id;
		
			this.resetSelect($('#returnedOrder_id'), true);
			if(accountId != '') {
                this.showFieldThrobber('#returnedOrder_id');
				this.salesOrderCollection.getSOByCustomer(accountId);
			}
		},
		
		generateSO: function () {
			var dropDown = '';
			_.each(this.salesOrderCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('order_number')+'</option>';
			});
			this.$el.find('#returnedOrder_id').append(dropDown);
			
			if(typeof this.selectedSOId != 'undefined' && this.selectedSOId != null) {
				this.$el.find('#returnedOrder_id').val(this.selectedSOId);
				this.selectedSOId = null;
			}
			else {
				if(this.salesOrderCollection.models.length == 1)
					this.$el.find('#returnedOrder_id').val(this.salesOrderCollection.models[0].get('id')).change();
			}
		},
		
		onChangeSO: function (ev) {
			var orderId = $(ev.currentTarget).val();
			if(orderId != '')
				this.orderProductsCollection.getOrderProduct(orderId);
			else
				this.generateAllProductDropdown();
		},
		
		generateOrderProductDropdown: function () {
			var thisObj = this;
			this.subContainer.find('#product-list .product_id').each(function () {
				var currentValue = $(this).val();
				$(this).html(thisObj.getOrderProductDropdown());
				
				if(currentValue != '' && $(this).find('option[value="'+currentValue+'"]').length > 0)
					$(this).val(currentValue);
				else
					$(this).val('').trigger('change');
			});
		},
		
		getOrderProductDropdown: function () {
			var dropDown = '<option value="">Select a product</option>';
			_.each(this.orderProductsCollection.models, function (model) {
				dropDown += '<option value="'+model.get('product').id+'">'+model.get('product').name+'</option>';
			});
			
			return dropDown;
		},
		
		generateAllProductDropdown: function () {
			var thisObj = this;
			this.subContainer.find('#product-list .product_id').each(function () {
				var currentValue = $(this).val();
				$(this).html(thisObj.getAllProductDropdown());
				
				if(currentValue != '' && $(this).find('option[value="'+currentValue+'"]').length > 0)
					$(this).val(currentValue);
			});
		},
		
		getAllProductDropdown: function () { //console.log('getAllProductDropdown'); console.log(this.productCollection.models);
			var dropDown = '<option value="">Select a product</option>';
			_.each(this.productCollection.models, function (model) {
				dropDown += '<option value="'+model.get('id')+'">'+model.get('name')+'</option>';
			});
			
			return dropDown;
		},
		
		otherInitializations: function () {},
	});

	return InventoryAddView;
  
});